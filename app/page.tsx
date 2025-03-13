// app/page.tsx
"use client";
import { useState } from 'react';
import dynamic from 'next/dynamic';
import FileUpload from '../components/FileUpload'; // Import the FileUpload component


const NeuralVisualization = dynamic(() => import('../components/NeuralVisualization'), {
  ssr: false,
});

export default function Home() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null); // Track uploaded file

  const handleUploadSuccess = (filename: string) => {
		setUploadedFile(filename);
        // Do whatever you want with the filename here.
        // You could, for example, send it to Claude for analysis.
	  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch('/api/anthropic', { // Correct API route
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (res.ok) {
        setResponse(data.response);
      } else {
        setError(data.error || 'An error occurred.');
      }
    } catch (err) {
        setError('Failed to communicate with the API.'); // More specific error
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
        {/* Display NeuralVisualization and Kanban */}
        <div style={{display: 'flex'}}>
            <div style={{width: '50vw'}}>
                {/* Put Kanban Component Here */}
            </div>
            <div style={{width: '50vw'}}>
               <NeuralVisualization />
            </div>
        </div>

      <h1>Ask Claude</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message for Claude..."
          rows={4}
          cols={50}
        />
        <br />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send to Claude'}
        </button>
      </form>
        <FileUpload onUploadSuccess={handleUploadSuccess}/>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {response && (
        <div>
          <h2>Claude's Response:</h2>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}