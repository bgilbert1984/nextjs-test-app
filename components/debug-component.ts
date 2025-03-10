'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';

interface TestResult {
  stdout: string;
  stderr: string;
}

interface AnalysisResult {
  failingTests: any[];
  possibleIssues: string[];
  suggestions: {
    title: string;
    code: string;
  }[];
}

const DebugPanel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TestResult | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [filePath, setFilePath] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const runTests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'runTest',
          payload: {} 
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setResults(data.result);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`Request failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const viewFile = async () => {
    if (!filePath) {
      setMessage('Please enter a file path');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'viewFile',
          payload: { filePath } 
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setFileContent(data.content);
        setMessage(null);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`Request failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeTests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyzeTests' })
      });
      
      const data = await response.json();
      if (data.success) {
        setResults(data.testResults);
        setAnalysis(data.analysis);
        setMessage(null);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`Request failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createHelpers = async (action: 'fixThreeMocks' | 'updateVitestConfig') => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      
      const data = await response.json();
      if (data.success) {
        setMessage(data.message);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`Request failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Claude 3.7 Debug Panel</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-2">View File</h2>
          <div className="flex mb-2">
            <input
              type="text"
              className="flex-grow p-2 border rounded-l"
              placeholder="components/NeuralVisualization.tsx"
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-r"
              onClick={viewFile}
              disabled={isLoading}
            >
              View
            </button>
          </div>
          
          <h2 className="text-lg font-semibold mb-2">Test Actions</h2>
          <div className="flex flex-col space-y-2">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={runTests}
              disabled={isLoading}
            >
              Run All Tests
            </button>
            <button
              className="bg-purple-500 text-white px-4 py-2 rounded"
              onClick={analyzeTests}
              disabled={isLoading}
            >
              Analyze Test Issues
            </button>
          </div>
          
          <h2 className="text-lg font-semibold mt-4 mb-2">Fix Helpers</h2>
          <div className="flex flex-col space-y-2">
            <button
              className="bg-yellow-500 text-white px-4 py-2 rounded"
              onClick={() => createHelpers('fixThreeMocks')}
              disabled={isLoading}
            >
              Create Three.js Mocks
            </button>
            <button
              className="bg-indigo-500 text-white px-4 py-2 rounded"
              onClick={() => createHelpers('updateVitestConfig')}
              disabled={isLoading}
            >
              Setup Vitest Config
            </button>
          </div>
          
          {message && (
            <div className="mt-4 p-3 bg-blue-100 text-blue-800 rounded">
              {message}
            </div>
          )}
        </Card>
        
        <Card className="p-4 overflow-auto">
          {fileContent ? (
            <div>
              <h2 className="text-lg font-semibold mb-2">File Content: {filePath}</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">
                {fileContent}
              </pre>
              <button
                className="mt-2 bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setFileContent(null)}
              >
                Clear
              </button>
            </div>
          ) : analysis ? (
            <div>
              <h2 className="text-lg font-semibold mb-2">Analysis Results</h2>
              
              {analysis.possibleIssues.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium">Possible Issues:</h3>
                  <ul className="list-disc pl-5">
                    {analysis.possibleIssues.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {analysis.suggestions.length > 0 && (
                <div>
                  <h3 className="font-medium">Suggestions:</h3>
                  {analysis.suggestions.map((suggestion, i) => (
                    <div key={i} className="mt-2">
                      <h4 className="font-medium">{suggestion.title}</h4>
                      <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-60 text-xs">
                        {suggestion.code}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : results ? (
            <div>
              <h2 className="text-lg font-semibold mb-2">Test Results</h2>
              <div className="mb-2">
                <h3 className="font-medium">Standard Output:</h3>
                <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-40 text-xs">
                  {results.stdout || '(No output)'}
                </pre>
              </div>
              
              {results.stderr && (
                <div>
                  <h3 className="font-medium text-red-600">Error Output:</h3>
                  <pre className="bg-red-50 p-2 rounded overflow-auto max-h-60 text-xs">
                    {results.stderr}
                  </pre>
                </div>
              )}
              
              <button
                className="mt-2 bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setResults(null)}
              >
                Clear
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No data to display. Run a command or view a file to see results here.
            </div>
          )}
        </Card>
      </div>
      
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-center">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
