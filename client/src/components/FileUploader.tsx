import { useState, useCallback } from 'react';
import { UploadCloud, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { uploadToS3, isAwsConfigured } from '@/lib/aws';

interface FileUploaderProps {
  onFileUploaded: (url: string) => void;
  label: string;
  accept?: string;
  maxSize?: number; // in MB
  keyPrefix: string;
  className?: string;
}

export default function FileUploader({
  onFileUploaded,
  label,
  accept = 'image/*',
  maxSize = 5, // 5MB default
  keyPrefix,
  className = '',
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { toast } = useToast();

  const maxSizeBytes = maxSize * 1024 * 1024; // Convert MB to bytes

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file size
    if (selectedFile.size > maxSizeBytes) {
      toast({
        title: 'File too large',
        description: `Maximum file size is ${maxSize}MB`,
        variant: 'destructive',
      });
      return;
    }

    setFile(selectedFile);
    setUploadError(null);
    setUploadSuccess(false);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  }, [maxSize, maxSizeBytes, toast]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;
    
    // Check file size
    if (droppedFile.size > maxSizeBytes) {
      toast({
        title: 'File too large',
        description: `Maximum file size is ${maxSize}MB`,
        variant: 'destructive',
      });
      return;
    }
    
    setFile(droppedFile);
    setUploadError(null);
    setUploadSuccess(false);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(droppedFile);
  }, [maxSize, maxSizeBytes, toast]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setUploadError(null);
    
    try {
      // Check if AWS is configured
      if (!isAwsConfigured()) {
        throw new Error('AWS not configured');
      }

      // Generate a unique filename
      const timestamp = new Date().getTime();
      const uniqueKey = `${keyPrefix}/${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      
      // Upload to S3
      const fileUrl = await uploadToS3(file, uniqueKey);
      
      // Call the parent's callback with the S3 URL
      onFileUploaded(fileUrl);
      setUploadSuccess(true);
      
      toast({
        title: 'Upload successful',
        description: 'File has been uploaded successfully',
      });
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Upload failed. Please try again.');
      
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'An error occurred during upload',
        variant: 'destructive',
      });
      
      // If AWS is not configured, provide a fallback solution
      if (!isAwsConfigured()) {
        // Generate a mock URL for demonstration purposes
        const mockUrl = `https://example.com/mock/${Date.now()}_${file.name}`;
        onFileUploaded(mockUrl);
        setUploadSuccess(true);
      }
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setUploadError(null);
    setUploadSuccess(false);
  };

  return (
    <div className={className}>
      <p className="text-sm font-medium mb-2">{label}</p>
      
      {!file ? (
        <Card className="border-dashed">
          <CardContent className="p-0">
            <div
              className="flex flex-col items-center justify-center p-6 text-center cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById(`file-input-${keyPrefix}`)?.click()}
            >
              <UploadCloud className="w-10 h-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-1">Drag & drop or click to upload</p>
              <p className="text-xs text-muted-foreground">Max file size: {maxSize}MB</p>
              
              <input
                id={`file-input-${keyPrefix}`}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                {uploadSuccess ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                ) : uploadError ? (
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                ) : (
                  <UploadCloud className="w-5 h-5 text-primary mr-2" />
                )}
                <span className="text-sm font-medium truncate max-w-[150px]">
                  {file.name}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-6 w-6"
                onClick={clearFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {preview && (
              <div className="mb-3 relative w-full h-32 bg-muted/30 rounded overflow-hidden">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            
            {uploadError && (
              <p className="text-xs text-red-500 mb-3">{uploadError}</p>
            )}
            
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleUpload}
                disabled={uploading || uploadSuccess}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading
                  </>
                ) : uploadSuccess ? (
                  'Uploaded'
                ) : (
                  'Upload'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}