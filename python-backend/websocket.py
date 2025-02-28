from fastapi import FastAPI, WebSocket
import uvicorn
import asyncio
import numpy as np

app = FastAPI()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Simulated fMRI Data (Replace with real data stream)
            data = np.random.rand(64, 64, 64).tolist()  # Simulating a 3D brain scan
            await websocket.send_json({"fmri_data": data})
            await asyncio.sleep(0.1)  # Simulate data stream delay
    except Exception as e:
        print(f"WebSocket disconnected: {e}")
    finally:
        await websocket.close()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)