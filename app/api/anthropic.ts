// pages/api/anthropic.ts
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  response?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    try {
      const { message } = req.body;

      const flaskResponse = await fetch('http://localhost:5000/api/ask-claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const data = await flaskResponse.json();

      if (flaskResponse.ok) {
        res.status(200).json({ response: data.response });
      } else {
        res.status(flaskResponse.status).json({ error: data.error || 'Unknown error from Flask backend' });
      }

    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch from Flask backend' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}