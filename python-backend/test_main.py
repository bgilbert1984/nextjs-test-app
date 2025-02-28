# test_main.py
import pytest
from fastapi.testclient import TestClient
from main import app  # Import your FastAPI app
import json
import time

@pytest.fixture(scope="module")
def test_client():
    with TestClient(app) as client:
        yield client

def test_websocket_connection(test_client):
    with test_client.websocket_connect("/ws") as websocket:
        data = websocket.receive_text()
        received_data = json.loads(data)
        assert "fmri_data" in received_data
        assert "speech" in received_data
        assert isinstance(received_data["fmri_data"], list)

def test_websocket_multiple_messages(test_client):
    with test_client.websocket_connect("/ws") as websocket:
        for _ in range(3): # Check several messages
            data = websocket.receive_text()
            received_data = json.loads(data)
            assert "fmri_data" in received_data
            assert "speech" in received_data

def test_websocket_disconnect(test_client):
     #This test sometimes fails; it depends on the exact timing of message receiving, sleep, and disconnection.
    with pytest.raises(Exception) as e:  # Expect an exception on disconnect
        with test_client.websocket_connect("/ws") as websocket:
            websocket.close()
            websocket.receive_text()  # This *should* raise an exception