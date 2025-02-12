// pages/api/test-mongodb.ts (Next.js API route example)
import type { NextApiRequest, NextApiResponse } from 'next';
import testMongoDBConnection, { MongoDBConnectionDetails } from '../../lib/test-mongodb-connection'; // Adjust path to your test-mongodb-connection component

interface TestMongoDBAPIRequest extends NextApiRequest {
  body: MongoDBConnectionDetails; // Expecting connection details in the request body
}

export default async function handler(
  req: TestMongoDBAPIRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed. Use POST.' });
  }

  const connectionDetails: MongoDBConnectionDetails = req.body;

  if (!connectionDetails || !connectionDetails.host || !connectionDetails.port || !connectionDetails.database) {
    return res.status(400).json({ success: false, message: 'Missing required connection details (host, port, database) in request body.' });
  }

  try {
    const connectionSuccessful = await testMongoDBConnection(connectionDetails);

    if (connectionSuccessful) {
      return res.status(200).json({ success: true, message: 'MongoDB connection test successful!' });
    } else {
      return res.status(500).json({ success: false, message: 'MongoDB connection test failed. Check error details in server logs.' }); // More detail in server logs
    }

  } catch (error: unknown) {
    console.error('Error during MongoDB connection test in API route:', error); // Log detailed error on server-side
    return res.status(500).json({ success: false, message: 'Error during MongoDB connection test.', error: (error as Error).message });
  }
};