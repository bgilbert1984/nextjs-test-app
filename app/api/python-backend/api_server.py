# python-backend/api_server.py
from flask import Flask, jsonify, request
import process_fmri  # Import the processing script

app = Flask(__name__)

# URL of your WSL2 Flask API (using SSH tunnel - or direct if not using WSL)
# No longer needed, as we're processing on the same server
# WSL2_API_URL = "http://localhost:5001/api/process"

@app.route('/api/local_process', methods=['POST'])
def local_process():
    try:
        data = request.get_json()
        filename = data.get('filename')  # Get filename from the request
        if not filename:
             return jsonify({"error": "No filename provided"}), 400

        # Process the fMRI data using the process_fmri function
        processed_data = process_fmri.process_fmri(filename)

        if processed_data:
             return jsonify(processed_data)
        else:
             return jsonify({"error": "Failed to process fMRI"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)