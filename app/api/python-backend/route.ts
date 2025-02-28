// /home/ashben/www/html/tipics/nextjs-test-app/app/api/python-backend/route.ts
import { NextResponse } from 'next/server';

const PYTHON_BACKEND_URL = 'http://localhost:5002/api/local_process'; // URL of your Flask API

export async function POST(request: Request) {
  try {
    const data = await request.json(); // Get data from Next.js frontend
        //Add the file name here:
        const requestData = {
            filename: "dummy_fmri.nii.gz", //Use your file here.
            ...data,
        }

    // Forward the request to the Flask API
    const response = await fetch(PYTHON_BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData), // Include filename
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error from Python backend:", errorText);
      return NextResponse.json({ error: `Python backend error: ${response.status} - ${errorText}` }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error communicating with Python backend:', error);
    return NextResponse.json({ error: 'Failed to communicate with Python backend' }, { status: 500 });
  }
}