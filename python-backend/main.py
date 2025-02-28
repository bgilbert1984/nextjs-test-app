from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
import asyncio
import time

app = FastAPI()

# CORS (Cross-Origin Resource Sharing) setup - VERY IMPORTANT!
origins = [
    "http://localhost:3000",  # Allow your Next.js frontend
    "localhost:3000"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

connected_clients = set()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.add(websocket)
    try:
        while True:
            # Simulate receiving fMRI data and processing it
            await asyncio.sleep(1)  # Simulate data arriving every second

            # Create mock fMRI data (replace with your actual data source)
            mock_fmri_data = [
                [time.time() * 1000 + i, i * 2, i * 3] for i in range(3)  # Example data
            ]
            mock_speech_data = "Example speech at " + str(time.time())

            data_to_send = {
                "fmri_data": mock_fmri_data,
                "speech": mock_speech_data
            }

            await websocket.send_text(json.dumps(data_to_send))  # Send to frontend

    except WebSocketDisconnect:
        connected_clients.remove(websocket)
    except Exception as e:
        print(f"Error: {e}")
        await websocket.close(code=1011)  # Internal Error code