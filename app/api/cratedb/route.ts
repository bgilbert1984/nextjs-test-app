declare module 'node-crate';

// app/api/cratedb/route.ts
import { NextResponse } from 'next/server';
import crate from 'node-crate';

// Connect to CrateDB.  Use environment variables for security!
const CRATE_HOST = process.env.CRATE_HOST || 'localhost'; // Or your CrateDB Cloud URL
const CRATE_PORT = process.env.CRATE_PORT || '4200'; // Default CrateDB HTTP port
const CRATE_USER = process.env.CRATE_USER || 'crate'; // Default CrateDB user
const CRATE_PASSWORD = process.env.CRATE_PASSWORD || ''; //  Password (if required)

// Construct the connection string.  Handle HTTPS and authentication.
const connectionString = `http://${CRATE_HOST}:${CRATE_PORT}`;

export async function GET(request: Request) {
  // Check method first
  if (request.method !== 'GET') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    crate.connect(connectionString, CRATE_USER, CRATE_PASSWORD); // Connect
    const data = await crate.execute('SELECT * FROM doc.mytable ORDER BY created_at DESC');
    return NextResponse.json({ data: data.rows });
  } catch (error: any) {
    console.error('Error fetching data from CrateDB:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  } finally {
    crate.close();
  }
}

// Add proper handling for other methods (POST, PUT, DELETE, etc.)
export async function POST(request: Request) {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
// ... add handlers for PUT, DELETE, etc. as needed.