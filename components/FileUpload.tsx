// components/FileUpload.tsx
"use client";
import React, { useState } from 'react';

interface FileUploadProps {
  onUploadSuccess?: (filename: string) => void; // Optional callback
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      setError(null); // Clear previous errors
      setUploadedFilename(null); // Clear previous upload
    }
  };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!file) {
            setError('Please select a file.');
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData, // Send FormData directly
                // Don't set Content-Type:  The browser sets it correctly with FormData
            });

            if (response.ok) {
                const data = await response.json();
                setUploadedFilename(data.filename);
	            onUploadSuccess?.(data.filename); // Call the callback if provided
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'An unknown error occurred during upload.');
            }
        } catch (error: any) {
            setError(error.message || 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };


  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload File'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {uploadedFilename && (
        <p>File uploaded successfully: {uploadedFilename}</p>
      )}
    </div>
  );
};

export default FileUpload;