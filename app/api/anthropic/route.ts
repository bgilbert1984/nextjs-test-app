// app/api/anthropic/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
      const { message } = await request.json();

      // Call the Rust backend on port 8080
      const rustResponse = await fetch('http://localhost:8080/api/ask-claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

        const data = await rustResponse.json();

        if (rustResponse.ok) {
            return NextResponse.json({ response: data.response });
        } else {
            return new NextResponse(JSON.stringify({ error: data.error || 'Unknown error from Rust backend' }), {
                status: rustResponse.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

    } catch (error) {
      console.error("Error fetching from Rust backend:", error);
        return new NextResponse(JSON.stringify({error: 'Failed to fetch from Rust backend' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// You *don't* need a GET handler unless you want to support GET requests.