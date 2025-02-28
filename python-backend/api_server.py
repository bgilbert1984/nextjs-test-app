# api_server.py (in your python-backend directory)
from flask import Flask, jsonify, request
import requests

app = Flask(__name__)

# URL of your WSL2 Flask API (using SSH tunnel - or direct if not using WSL)
WSL2_API_URL = "http://localhost:5001/api/process"  # Adjust if necessary

@app.route('/api/local_process', methods=['POST'])
def local_process():
    try:
        data = request.get_json()

        # Forward the request to your WSL2 API (or your other Python API)
        response = requests.post(WSL2_API_URL, json=data)
        response.raise_for_status()  # Raise an exception for bad status codes

        result = response.json()
        return jsonify(result)

    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)