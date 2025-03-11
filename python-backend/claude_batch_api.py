import os
import anthropic
import fnmatch  # For matching .gitignore patterns
import re
from dotenv import load_dotenv

load_dotenv()

# --- Constants and Configuration ---

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
CODEBASE_PATH = "/home/ashben/www/html/tipics/nextjs-test-app"
MAX_TOKENS_PER_CHUNK = 2048  # Adjust as needed.  Keep it well below the model's max.
MODEL_NAME = "claude-3.5-sonnet-20240229"  # Or another appropriate model
BATCH_SIZE = 50 # Number of chunks to send per API request. Adjust as needed.

# --- Helper Functions ---
def load_gitignore(gitignore_path: str) -> list[str]:
    """Loads patterns from a .gitignore file."""
    patterns = []
    try:
        with open(gitignore_path, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):  # Ignore comments and empty lines
                    patterns.append(line)
    except FileNotFoundError:
        pass  # It's okay if there's no .gitignore
    return patterns

def is_ignored(path: str, gitignore_patterns: list[str]) -> bool:
    """Checks if a path should be ignored based on .gitignore patterns."""
    for pattern in gitignore_patterns:
        if fnmatch.fnmatch(path, pattern):
            return True
        # Handle directory patterns (e.g., "node_modules/")
        if pattern.endswith("/") and path.startswith(pattern):
            return True
    return False

def chunk_file(file_path: str, max_tokens: int) -> list[str]:
    """Splits a file into chunks, respecting token limits (roughly)."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading file {file_path}: {e}")
        return []

    # Simple chunking by lines (better than splitting in the middle of a word)
    lines = content.splitlines()
    chunks = []
    current_chunk = []
    current_length = 0

    for line in lines:
        line_length = len(line) + 1  # +1 for the newline character
        if current_length + line_length <= max_tokens:
            current_chunk.append(line)
            current_length += line_length
        else:
            chunks.append("\n".join(current_chunk))
            current_chunk = [line]
            current_length = line_length
    if current_chunk:  # Add the last chunk
        chunks.append("\n".join(current_chunk))

    return chunks

def create_batch_requests(codebase_path: str, gitignore_patterns: list[str], max_tokens: int, prompt_template:str) -> list[dict]:
    """Creates a list of batch requests, chunking files and formatting prompts."""
    batch_requests = []
    for root, _, files in os.walk(codebase_path):
        for file in files:
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, codebase_path)  # Relative path

            if not is_ignored(rel_path, gitignore_patterns):
                chunks = chunk_file(file_path, max_tokens)
                for i, chunk in enumerate(chunks):
                    prompt = prompt_template.format(file_path=rel_path, chunk_number=i + 1, total_chunks=len(chunks), code_chunk=chunk)
                    batch_requests.append({
                        "model": MODEL_NAME,
                        "max_tokens": 1024,  # Adjust as needed
                        "messages": [{"role": "user", "content": prompt}],
                    })
    return batch_requests

def send_batch_request(client: anthropic.Anthropic, batch: list[dict]) -> list[str]:
    """Sends a batch of requests to the Anthropic API."""
    try:
		# !!! HYPOTHETICAL ENDPOINT - Check Anthropic Documentation !!!
        response = client.post("/v1/messages/batch", json={"messages": batch})
        response.raise_for_status()
        response_data = response.json()

        return [
            r["content"][0]["text"]
            if "content" in r and r["content"] and isinstance(r["content"], list) and r["content"][0].get("type") == "text"
            else f"Error: Invalid response format. {r=}"
            for r in response_data
        ]
    except Exception as e:
        print(f"Error sending batch request: {e}")
        return [""] * len(batch)


# --- Main Script ---

if __name__ == "__main__":
    if not ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY environment variable not set.")

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    gitignore_patterns = load_gitignore(os.path.join(CODEBASE_PATH, ".gitignore"))

    # --- CHOOSE YOUR PROMPTING STRATEGY HERE ---
    # Example 1: Simple file analysis
    prompt_template = """
    File: {file_path} (Chunk {chunk_number} of {total_chunks})

    Code:
    ```
    {code_chunk}
    ```

    Analyze the above code chunk.  Provide a brief summary of its purpose and functionality.
    """
    # Example 2: Find potential bugs
    # prompt_template = """ ... (same file/chunk info) ...
    # Identify any potential bugs or vulnerabilities in the above code.
    # """

    # Example 3: Code Documentation
    #     prompt_template = """ ... (same file/chunk info) ...
    #     Write clear and concise documentation for this code chunk.
    #     """

    batch_requests = create_batch_requests(CODEBASE_PATH, gitignore_patterns, MAX_TOKENS_PER_CHUNK, prompt_template)

    all_responses = []
    # Send in batches of BATCH_SIZE
    for i in range(0, len(batch_requests), BATCH_SIZE):
        batch = batch_requests[i:i + BATCH_SIZE]
        responses = send_batch_request(client, batch)
        all_responses.extend(responses)
        print(f"Processed batch {i // BATCH_SIZE + 1} of { (len(batch_requests) + BATCH_SIZE -1) // BATCH_SIZE}")


    # --- Process the responses ---
    # (e.g., print them, save to a file, analyze them further)
    for i, response in enumerate(all_responses):
        print(f"--- Response for Chunk {i+1} ---")
        print(response)
        print("-" * 20)

    print("Finished processing.")