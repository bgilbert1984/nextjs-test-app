from flask import Flask, request, jsonify
from anthropic import Anthropic, APIConnectionError, AuthenticationError, BadRequestError
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env

app = Flask(__name__)

# Load API key from environment variable.  Best practice!
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")

@app.route('/api/ask-claude', methods=['POST'])
def ask_claude():
    try:
        data = request.get_json()
        user_message = data.get('message', 'Hello, Claude')  # Default message

        client = Anthropic(api_key=ANTHROPIC_API_KEY)
        message = client.messages.create(
            model="claude-3.5-sonnet-20240229",  # Use 3.5 Sonnet. Updated model name.
            max_tokens=1024,
            messages=[
                {"role": "user", "content": user_message}
            ]
        )
        return jsonify({'response': message.content[0].text}) #Return text of response.

    except AuthenticationError:
        return jsonify({'error': 'Authentication failed. Check your API key.'}), 500
    except BadRequestError as e:
        return jsonify({'error': f'Bad request to Anthropic API: {e}'}), 400
    except APIConnectionError as e:
         return jsonify({'error': f'Failed to connect to Anthropic API: {e}'}), 500
    except Exception as e:
        return jsonify({'error': f'An unexpected error occurred: {e}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5010) # Run on port 5010