// app/api/websocket/route.ts
import { NextResponse } from 'next/server';
import { WebSocketServer } from 'ws';  // Use the 'ws' library
import zlib from 'zlib'; // Import the 'zlib' library

let wss: WebSocketServer | null = null;

export async function GET(request: Request) {
    if (!wss) {
        wss = new WebSocketServer({ port: 8080 }); // Use a different port from your Next.js app

        wss.on('connection', ws => {
            console.log('Client connected to Next.js WebSocket server');

            ws.on('error', console.error);

            // Send data periodically (replace with your actual data fetching)
            const intervalId = setInterval(async () => {
                if (ws.readyState === ws.OPEN) { // Check if the connection is still open
                  try{
                    const response = await fetch('http://localhost:3000/api/cratedb'); // Fetch data
                    if(!response.ok) throw new Error(`Bad response ${response.status}`);

                    const data = await response.json();

                    // Compress the data using zlib
                    const compressedData = zlib.deflateSync(JSON.stringify(data));

                    ws.send(compressedData); // Send compressed data
                    console.log("Data sent");
                  }
                  catch(err){
                    console.error(err);
                  }
                } else if (ws.readyState === ws.CLOSED || ws.readyState === ws.CLOSING){
                    clearInterval(intervalId);
                    console.log("Websocket connection closed")
                }
            }, 1000); // Send data every second (adjust as needed)

            ws.on('close', () => {
                console.log('Client disconnected from Next.js WebSocket server');
                clearInterval(intervalId); // Stop sending data when client disconnects
            });
        });

        console.log('Next.js WebSocket server started on port 8080');
    }

    return new NextResponse(null, { status: 200 }); // Return a simple response
}