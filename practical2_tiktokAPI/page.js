'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

export default function FileUploadPage() {
  const [filePreview, setFilePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Handle dropped files
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);

      // For images, create a preview URL
      if (file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        setFilePreview({
          url: previewUrl,
          name: file.name,
          type: file.type
        });
      }
      // For PDFs, just store the name and type (no preview URL needed)
      else if (file.type === 'application/pdf') {
        setFilePreview({
          name: file.name,
          type: file.type
        });
      } else {
        // For other file types
        setFilePreview(null);
      }

      // Reset any previous upload result
      setUploadResult(null);
      setUploadProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  // Handle file upload submission
  const onSubmit = async () => {
    if (!selectedFile) {
      alert('Please select a file first.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', selectedFile.name);

      // Log what we're trying to upload for debugging
      console.log('Uploading file:', selectedFile.name, 'Type:', selectedFile.type);

      // POST to Express backend
      const response = await axios.post('http://localhost:8000/api/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const percentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentage);
        }
      });

      setUploadResult({
        success: true,
        message: 'File uploaded successfully!',
        data: response.data
      });
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({
        success: false,
        message: error.response?.data?.error || 'Upload failed'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">File Upload</h1>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <p className="text-gray-500">
            {isDragActive
              ? 'Drop the file here...'
              : 'Drag & drop a file here, or click to select'}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Accepted: JPEG, PNG, PDF — Max 5MB
          </p>
        </div>

        {/* File Preview */}
        {filePreview && (
          <div className="mb-4 mt-4">
            <h3 className="font-medium mb-1">Preview:</h3>
            <div className="border rounded p-2">
              {filePreview.type?.startsWith('image/') ? (
                /* Show actual preview for images */
                <img
                  src={filePreview.url}
                  alt={filePreview.name}
                  className="max-w-full h-auto max-h-40 rounded"
                />
              ) : filePreview.type === 'application/pdf' ? (
                /* Just show file name for PDFs */
                <div className="py-2 px-3 bg-gray-100 rounded flex items-center">
                  <svg
                    className="w-6 h-6 text-red-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                    <path d="M3 8a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                  </svg>
                  <span>{filePreview.name}</span>
                </div>
              ) : (
                /* Generic file info for other types */
                <div>File selected: {filePreview.name}</div>
              )}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Upload Result */}
        {uploadResult && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm ${
              uploadResult.success
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            <p className="font-medium">{uploadResult.message}</p>
            {uploadResult.success && uploadResult.data && (
              <ul className="mt-1 text-xs space-y-1">
                <li>Name: {uploadResult.data.originalName}</li>
                <li>Type: {uploadResult.data.mimetype}</li>
                <li>Size: {(uploadResult.data.size / 1024).toFixed(1)} KB</li>
                <li>
                  URL:{' '}
                  <a
                    href={`http://localhost:8000${uploadResult.data.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    View file
                  </a>
                </li>
              </ul>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={onSubmit}
          disabled={isUploading || !selectedFile}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {isUploading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>
    </div>
  );
}
