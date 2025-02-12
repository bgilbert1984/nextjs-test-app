// components/CaptivePortal.tsx
"use client";
import { useEffect, useState } from 'react';

interface GeoLocationResponse {
  isUS: boolean;
}

const CaptivePortal: React.FC = () => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const checkGeolocation = async () => {
      try {
        const response = await fetch('/api/geo'); // Assuming you have an API route to handle this
        if (!response.ok) {
          throw new Error('Geolocation check failed');
        }
        const data: GeoLocationResponse = await response.json();
        setShouldShow(!data.isUS);
      } catch (error) {
        console.error('Error during geolocation check:', error);
        setShouldShow(true); // Default to showing the portal on error
      }
    };

    checkGeolocation();
  }, []);

  if (!shouldShow) {
    return null; // Or some other placeholder/loading state if needed
  }

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          International Access
        </h2>
        <p className="text-center mb-4">
          This content is intended for the United States residents.
        </p>
        <div className="flex justify-center">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => setShouldShow(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaptivePortal;