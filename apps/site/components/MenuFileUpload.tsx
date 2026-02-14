'use client';

import React, { useState, useCallback } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadedFile {
  id: string;
  fileName: string;
  fileUrl: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  status: 'uploading' | 'uploaded' | 'error';
}

interface MenuFileUploadProps {
  onFilesChange: (files: UploadedFile[]) => void;
  leadId?: string;
  maxFiles?: number;
  className?: string;
}

export default function MenuFileUpload({
  onFilesChange,
  leadId,
  maxFiles = 5,
  className = ''
}: MenuFileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `${file.name}: Invalid file type. Only PDF, JPG, and PNG are allowed.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: File too large. Maximum size is 10MB.`;
    }
    return null;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-400" />;
    }
    return <ImageIcon className="w-5 h-5 text-blue-400" />;
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Check max files limit
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed. Please remove some files first.`);
      return;
    }

    // Validate files
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        validationErrors.push(error);
      } else {
        validFiles.push(file);
      }
    }

    if (validationErrors.length > 0) {
      setError(validationErrors.join(' '));
      setTimeout(() => setError(null), 5000);
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      // Create FormData
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('files', file);
      });
      if (leadId) {
        formData.append('leadId', leadId);
      }

      // Upload to API
      const response = await fetch('/api/menu-upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.errors?.join(' ') || 'Upload failed');
      }

      // Add uploaded files to state
      const newFiles = result.files.map((file: any) => ({
        ...file,
        status: 'uploaded' as const
      }));

      const updatedFiles = [...uploadedFiles, ...newFiles];
      setUploadedFiles(updatedFiles);
      onFilesChange(updatedFiles);

      if (result.errors && result.errors.length > 0) {
        setError(result.errors.join(' '));
        setTimeout(() => setError(null), 5000);
      }

    } catch (err) {
      console.error('[MenuFileUpload] Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload files');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [uploadedFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
    // Reset input
    e.target.value = '';
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter(f => f.id !== fileId);
    setUploadedFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  return (
    <div className={className}>
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging
            ? 'border-teal-500 bg-teal-500/10'
            : 'border-zinc-600 bg-zinc-800/30 hover:border-zinc-500'
          }
        `}
      >
        <input
          type="file"
          id="menu-file-upload"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple
          onChange={handleFileInput}
          disabled={isUploading || uploadedFiles.length >= maxFiles}
          className="hidden"
        />
        
        <label
          htmlFor="menu-file-upload"
          className="cursor-pointer flex flex-col items-center gap-3"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
              <span className="text-sm text-zinc-300">Uploading files...</span>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-zinc-400" />
              <div>
                <span className="text-sm font-medium text-teal-400 hover:text-teal-300">
                  Click to upload
                </span>
                <span className="text-sm text-zinc-400"> or drag and drop</span>
              </div>
              <p className="text-xs text-zinc-500">
                PDF, JPG, or PNG (max 10MB per file, {maxFiles} files max)
              </p>
            </>
          )}
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-zinc-300 mb-2">
            Uploaded Files ({uploadedFiles.length}/{maxFiles})
          </h4>
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg"
            >
              {getFileIcon(file.fileType)}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{file.fileName}</p>
                <p className="text-xs text-zinc-400">{formatFileSize(file.fileSize)}</p>
              </div>
              {file.status === 'uploaded' && (
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              )}
              <button
                onClick={() => removeFile(file.id)}
                className="text-zinc-400 hover:text-red-400 transition-colors flex-shrink-0"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

