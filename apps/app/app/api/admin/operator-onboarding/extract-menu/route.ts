import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { adminClient } from '../../../../../lib/supabase';

/**
 * POST /api/admin/operator-onboarding/extract-menu
 * 
 * Extracts menu data from uploaded files and saves it to the lead
 * Also deletes files from storage after extraction to minimize costs
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leadId, extractedData } = body;

    if (!leadId || !extractedData) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: leadId, extractedData'
      }, { status: 400 });
    }

    // Get the lead event
    const event = await prisma.reflexEvent.findUnique({
      where: { id: leadId }
    });

    if (!event || !event.payload) {
      return NextResponse.json({
        success: false,
        error: 'Lead not found or has no payload'
      }, { status: 404 });
    }

    // Parse existing payload
    const existingPayload = JSON.parse(event.payload);
    let updatedPayload: any;
    
    if (existingPayload.behavior && existingPayload.behavior.payload) {
      updatedPayload = { ...existingPayload };
      updatedPayload.behavior.payload = { ...existingPayload.behavior.payload };
    } else {
      updatedPayload = { ...existingPayload };
    }

    const targetPayload = updatedPayload.behavior?.payload || updatedPayload;

    // Save extracted menu data
    targetPayload.extractedMenuData = extractedData;
    targetPayload.menuExtractedAt = new Date().toISOString();
    targetPayload.menuExtractedBy = 'admin'; // TODO: Get from auth context

    // Update menu file statuses to 'extracted' in database
    if (targetPayload.menuFiles && Array.isArray(targetPayload.menuFiles)) {
      // Update menu_files table records
      for (const file of targetPayload.menuFiles) {
        try {
          await prisma.$executeRawUnsafe(`
            UPDATE public.menu_files
            SET status = 'extracted',
                processed_at = NOW(),
                extracted_data = $1
            WHERE lead_id = $2 AND file_name = $3
          `,
            JSON.stringify(extractedData),
            leadId,
            file.fileName
          );
        } catch (fileError: any) {
          // If menu_files table doesn't exist, log and continue
          if (fileError?.message?.includes('does not exist') || fileError?.code === '42P01') {
            console.warn('[Extract Menu API] menu_files table not found, skipping file status update');
          } else {
            console.error('[Extract Menu API] Error updating menu file status:', fileError);
          }
        }
      }
    }

    // Update the lead event
    await prisma.reflexEvent.update({
      where: { id: leadId },
      data: {
        payload: JSON.stringify(updatedPayload)
      }
    });

    // If demo tenant exists, inject menu data into it
    const demoTenantId = targetPayload.demoTenantId;
    if (demoTenantId) {
      try {
        await injectMenuDataIntoDemo(demoTenantId, extractedData);
        console.log('[Extract Menu API] Menu data injected into demo tenant:', demoTenantId);
      } catch (injectError) {
        console.error('[Extract Menu API] Error injecting menu data into demo (non-critical):', injectError);
        // Non-critical - continue anyway
      }
    }

    // Delete files from Supabase Storage (to minimize storage costs)
    const supabase = adminClient();
    const deletedFiles: string[] = [];
    const failedDeletes: string[] = [];

    if (targetPayload.menuFiles && Array.isArray(targetPayload.menuFiles)) {
      for (const file of targetPayload.menuFiles) {
        if (file.filePath) {
          try {
            const { error } = await supabase.storage
              .from('menu-files')
              .remove([file.filePath]);

            if (error) {
              console.error(`[Extract Menu API] Error deleting file ${file.fileName}:`, error);
              failedDeletes.push(file.fileName);
            } else {
              deletedFiles.push(file.fileName);
              console.log(`[Extract Menu API] ✅ Deleted file from storage: ${file.fileName}`);
            }
          } catch (deleteError) {
            console.error(`[Extract Menu API] Error deleting file ${file.fileName}:`, deleteError);
            failedDeletes.push(file.fileName);
          }
        }
      }
    }

    // Update menu_files table to mark as deleted
    if (deletedFiles.length > 0) {
      try {
        await prisma.$executeRawUnsafe(`
          UPDATE public.menu_files
          SET status = 'deleted',
              deleted_at = NOW()
          WHERE lead_id = $1 AND file_name = ANY($2::text[])
        `,
          leadId,
          deletedFiles
        );
      } catch (updateError: any) {
        // Non-critical - log and continue
        if (updateError?.message?.includes('does not exist') || updateError?.code === '42P01') {
          console.warn('[Extract Menu API] menu_files table not found, skipping delete status update');
        } else {
          console.error('[Extract Menu API] Error updating delete status:', updateError);
        }
      }
    }

    // Handle failed deletions (Phase 6: Fallback)
    if (failedDeletes.length > 0) {
      const failedFileObjects = targetPayload.menuFiles
        ?.filter((f: any) => failedDeletes.includes(f.fileName))
        .map((f: any) => ({ fileName: f.fileName, filePath: f.filePath })) || [];
      
      await handleFailedDeletes(failedFileObjects, leadId);
    }

    return NextResponse.json({
      success: true,
      message: 'Menu data extracted and saved successfully',
      deletedFiles: deletedFiles.length,
      failedDeletes: failedDeletes.length,
      warnings: failedDeletes.length > 0 
        ? `Failed to delete ${failedDeletes.length} file(s). They will be cleaned up manually: ${failedDeletes.join(', ')}` 
        : undefined
    });

  } catch (error) {
    console.error('[Extract Menu API] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to extract menu data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

