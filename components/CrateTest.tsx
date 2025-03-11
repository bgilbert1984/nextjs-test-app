// components/CrateTest.tsx
import React, { useEffect, useState } from 'react';

interface CrateItem {
  id: number;
  name: string;
  created_at: string;
}

const CrateTest: React.FC = () => {
  const [items, setItems] = useState<CrateItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/cratedb');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || !data.data) {
          throw new Error('Invalid response format');
        }
        
        setItems(data.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(`Error: ${err.message}`);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <div>CrateTest Component</div>
      
      {loading && <div>Loading...</div>}
      
      {error && <div>{error}</div>}
      
      {!loading && !error && items.length === 0 && (
        <div>No items found</div>
      )}
      
      {!loading && !error && items.length > 0 && (
        <ul role="list">
          {items.map((item) => (
            <li key={item.id}>
              {item.name} - {item.created_at}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CrateTest;