import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// CORRECTED CONNECTION STRING:
const uri = 'mongodb://ashbendb:983196bg@localhost:27017/ashbendb';

export async function GET() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db('ashbendb'); //Double check this.
    const collection = database.collection('testCollection');
    const result = await collection.find({}).toArray();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error); // Log the error details
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  } finally {
    await client.close();
  }
}