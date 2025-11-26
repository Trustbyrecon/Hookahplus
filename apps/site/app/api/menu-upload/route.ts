import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for storage operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[Menu Upload API] Missing Supabase credentials');
}

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'File upload service not configured' },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const leadId = formData.get('leadId') as string | null;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate files
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    for (const file of files) {
      // Check file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        validationErrors.push(`${file.name}: Invalid file type. Only PDF, JPG, and PNG are allowed.`);
        continue;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        validationErrors.push(`${file.name}: File too large. Maximum size is 10MB.`);
        continue;
      }

      validFiles.push(file);
    }

    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        errors: validationErrors
      }, { status: 400 });
    }

    // Upload files to Supabase Storage
    const uploadResults = [];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';

    for (const file of validFiles) {
      try {
        // Generate unique file name: leadId_timestamp_filename
        const timestamp = Date.now();
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = leadId
          ? `${leadId}/${timestamp}_${sanitizedFileName}`
          : `temp/${timestamp}_${sanitizedFileName}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('menu-files')
          .upload(filePath, file, {
            contentType: file.type,
            upsert: false
          });

        if (uploadError) {
          console.error(`[Menu Upload API] Upload error for ${file.name}:`, uploadError);
          validationErrors.push(`${file.name}: Upload failed - ${uploadError.message}`);
          continue;
        }

        // Get public URL (or signed URL for private bucket)
        const { data: urlData } = supabase.storage
          .from('menu-files')
          .getPublicUrl(filePath);

        const fileUrl = urlData.publicUrl;

        // Create MenuFile record in database via app API
        // Note: We'll create the record when the lead is created, or via a separate API call
        // For now, return the file URL and metadata
        uploadResults.push({
          id: `file_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
          fileName: file.name,
          fileUrl: fileUrl,
          filePath: filePath, // Store path for deletion later
          fileType: file.type,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
          status: 'uploaded'
        });

        console.log(`[Menu Upload API] ✅ Uploaded ${file.name} to ${filePath}`);
      } catch (error) {
        console.error(`[Menu Upload API] Error uploading ${file.name}:`, error);
        validationErrors.push(`${file.name}: Upload failed - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (uploadResults.length === 0) {
      return NextResponse.json({
        success: false,
        errors: validationErrors
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      files: uploadResults,
      errors: validationErrors.length > 0 ? validationErrors : undefined
    });

  } catch (error) {
    console.error('[Menu Upload API] Unhandled error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload files',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint for file cleanup (called after menu data extraction)
export async function DELETE(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'File upload service not configured' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json(
        { success: false, error: 'Missing file path' },
        { status: 400 }
      );
    }

    // Delete from Supabase Storage
    const { error: deleteError } = await supabase.storage
      .from('menu-files')
      .remove([filePath]);

    if (deleteError) {
      console.error('[Menu Upload API] Delete error:', deleteError);
      return NextResponse.json({
        success: false,
        error: 'Failed to delete file',
        details: deleteError.message
      }, { status: 500 });
    }

    console.log(`[Menu Upload API] ✅ Deleted file: ${filePath}`);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('[Menu Upload API] Delete error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

