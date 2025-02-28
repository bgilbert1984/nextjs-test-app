"use client";

import { useEffect, useState } from 'react';

interface DataItem {
  id: number;
  name: string;
  created_at: string; // Adjust types as needed
}

const CrateTest = () => {
  const [data, setData] = useState<DataItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/cratedb'); // CORRECT API ROUTE
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (error:any) {
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
      <h2>CrateDB Data</h2>
      <ul>
        {data.map((item) => (
          <li key={item.id}>
            {item.name} - {item.created_at}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CrateTest;