import { storage, auth } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL, UploadTask } from 'firebase/storage';
import type { FirebaseError } from 'firebase/app';

interface UploadOptions {
  maxSizeMB?: number;
  onProgress?: (progress: number) => void;
  allowedTypes?: string[];
  retryAttempts?: number;
  retryDelay?: number;
}

interface UploadResult {
  url: string;
  path: string;
  filename: string;
}

export class UploadError extends Error {
  constructor(
    message: string,
    public code?: string,
    public serverResponse?: any
  ) {
    super(message);
    this.name = 'UploadError';
  }
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function uploadFile(
  file: File,
  path: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const {
    maxSizeMB = 5,
    onProgress,
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/epub+zip'],
    retryAttempts = 3,
    retryDelay = 1000
  } = options;

  // Debug logs
  console.log('Upload started:', {
    fileName: file.name,
    fileSize: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
    fileType: file.type,
    path,
    auth: {
      currentUser: auth.currentUser?.uid,
      email: auth.currentUser?.email
    }
  });

  // Verify storage is initialized
  if (!storage) {
    console.error('Storage not initialized');
    throw new UploadError('Storage not initialized');
  }

  // Verify authentication
  if (!auth.currentUser) {
    console.error('User not authenticated');
    throw new UploadError('Authentication required');
  }

  // Validate file size
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > maxSizeMB) {
    console.error(`File size (${fileSizeMB.toFixed(2)}MB) exceeds limit of ${maxSizeMB}MB`);
    throw new UploadError(`File size exceeds ${maxSizeMB}MB limit`);
  }

  // Validate file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    console.error(`File type ${file.type} not allowed. Allowed types:`, allowedTypes);
    throw new UploadError(`File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }

  // Create unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split('.').pop();
  const filename = `${timestamp}-${randomString}.${extension}`;
  const fullPath = `${path}/${filename}`;

  console.log('Generated upload path:', fullPath);

  // Create storage reference
  const storageRef = ref(storage, fullPath);
  let lastError: Error | null = null;

  // Retry loop
  for (let attempt = 1; attempt <= retryAttempts; attempt++) {
    try {
      console.log(`Upload attempt ${attempt}/${retryAttempts}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      const uploadPromise = new Promise<UploadResult>((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload progress for ${fullPath}: ${progress.toFixed(2)}%`);
            onProgress?.(progress);
          },
          (error: FirebaseError) => {
            console.error(`Upload error (attempt ${attempt}):`, {
              code: error.code,
              message: error.message,
              serverResponse: error.customData?.serverResponse
            });
            reject(error);
          },
          async () => {
            try {
              console.log('Upload completed, getting download URL...');
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('Download URL obtained:', url);
              resolve({
                url,
                path: fullPath,
                filename
              });
            } catch (error) {
              console.error('Failed to get download URL:', error);
              reject(new UploadError('Failed to get download URL'));
            }
          }
        );
      });

      return await uploadPromise;

    } catch (error) {
      lastError = error as Error;
      
      if (attempt < retryAttempts) {
        console.log(`Retrying upload in ${retryDelay}ms...`);
        await delay(retryDelay);
      }
    }
  }

  console.error('All upload attempts failed:', lastError);
  throw lastError instanceof UploadError ? lastError : new UploadError(
    lastError?.message || 'Upload failed after all retry attempts',
    'storage/retry-exhausted'
  );
}