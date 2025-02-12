"use client";

import { useEffect, useState } from 'react';

interface DataItem {
  _id: string;
  name: string;
}

const MongoTest = () => {
  const [data, setData] = useState<DataItem[] | null>(null); // Specify type
  const [error, setError] = useState<string | null>(null); // Add error state

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/mongodb');
        if (!response.ok) { // Check for HTTP errors
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (error: any) {
        console.error('Failed to fetch data:', error);
        setError(error.message || 'Failed to fetch data'); // Set error message
      }
    }

    fetchData();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>MongoDB Test Data</h2>
      <ul>
        {data.map((item) => (
          <li key={item._id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default MongoTest;