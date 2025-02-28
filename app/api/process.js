// app/api/process.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
      try {
          const response = await fetch('/api/local_process', { // Use the NEW local route
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(req.body),
          });
          const data = await response.json();
          res.status(200).json(data);
      } catch (error) {
          res.status(500).json({ error: 'Failed to process data' });
      }
  } else {
      res.status(405).end(); // Method Not Allowed
  }
}