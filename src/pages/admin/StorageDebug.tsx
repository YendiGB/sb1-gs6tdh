import React, { useState, useEffect } from 'react';
import { uploadFile } from '../../lib/storage';
import { storage, auth } from '../../lib/firebase';
import { ref, listAll, deleteObject } from 'firebase/storage';
import { useAuthStore } from '../../store/authStore';

const StorageDebug: React.FC = () => {
  const { userData } = useAuthStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadPath, setUploadPath] = useState('test');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [files, setFiles] = useState<string[]>([]);
  const [authInfo, setAuthInfo] = useState<{
    uid?: string;
    email?: string;
    isAdmin?: boolean;
    token?: string;
  }>({});
  const [listError, setListError] = useState<string | null>(null);

  useEffect(() => {
    loadAuthInfo();
  }, [userData]);

  const loadAuthInfo = async () => {
    if (!auth.currentUser) {
      setAuthInfo({});
      return;
    }

    try {
      const token = await auth.currentUser.getIdToken();
      const tokenResult = await auth.currentUser.getIdTokenResult();
      
      setAuthInfo({
        uid: auth.currentUser.uid,
        email: auth.currentUser.email || undefined,
        isAdmin: userData?.role === 'admin',
        token: token.substring(0, 20) + '...' // Only show part of the token for security
      });
    } catch (error) {
      console.error('Error loading auth info:', error);
      setAuthInfo({
        uid: auth.currentUser.uid,
        email: auth.currentUser.email || undefined,
        isAdmin: userData?.role === 'admin'
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadProgress(0);
    setUploadError(null);
    setUploadResult(null);

    try {
      const result = await uploadFile(selectedFile, uploadPath, {
        maxSizeMB: 10,
        onProgress: (progress) => setUploadProgress(progress),
        retryAttempts: 3,
        retryDelay: 1000
      });

      setUploadResult(JSON.stringify(result, null, 2));
      await listFiles();
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploadProgress(null);
    }
  };

  const listFiles = async () => {
    if (!storage) return;
    setListError(null);

    try {
      const listRef = ref(storage, uploadPath);
      const result = await listAll(listRef);
      setFiles(result.items.map(item => item.fullPath));
    } catch (error) {
      console.error('Error listing files:', error);
      setListError(error instanceof Error ? error.message : 'Failed to list files');
    }
  };

  const deleteFile = async (path: string) => {
    if (!storage) return;

    try {
      const fileRef = ref(storage, path);
      await deleteObject(fileRef);
      await listFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      setListError(error instanceof Error ? error.message : 'Failed to delete file');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Storage Debug</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Auth Status</h2>
        <pre className="bg-gray-50 p-4 rounded-lg overflow-auto">
          {JSON.stringify(authInfo, null, 2)}
        </pre>
        <button
          onClick={loadAuthInfo}
          className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
        >
          Refresh Auth Info
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Upload Test</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Path
            </label>
            <input
              type="text"
              value={uploadPath}
              onChange={(e) => setUploadPath(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File
            </label>
            <input
              type="file"
              onChange={handleFileSelect}
              className="w-full"
            />
          </div>

          {selectedFile && (
            <div className="text-sm text-gray-600">
              Selected file: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile}
            className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
          >
            Upload File
          </button>

          {uploadProgress !== null && (
            <div className="text-sm text-gray-600">
              Upload progress: {uploadProgress.toFixed(2)}%
            </div>
          )}

          {uploadError && (
            <div className="text-sm text-red-600">
              Error: {uploadError}
            </div>
          )}

          {uploadResult && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Result:</h3>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                {uploadResult}
              </pre>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Files in Storage</h2>
        <button
          onClick={listFiles}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg mb-4"
        >
          Refresh List
        </button>

        {listError && (
          <div className="text-sm text-red-600 mb-4">
            Error: {listError}
          </div>
        )}

        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
            >
              <span className="text-sm font-mono">{file}</span>
              <button
                onClick={() => deleteFile(file)}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                Delete
              </button>
            </div>
          ))}
          {files.length === 0 && !listError && (
            <div className="text-sm text-gray-500 text-center py-4">
              No files found in this path
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StorageDebug;