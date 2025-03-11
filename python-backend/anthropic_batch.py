import os
import anthropic
import fnmatch  # For matching .gitignore patterns
import re
from dotenv import load_dotenv
import asyncio  # Import asyncio

load_dotenv()

# --- Constants and Configuration ---

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
CODEBASE_PATH = "/home/ashben/www/html/tipics/nextjs-test-app" #Correct Path
MAX_TOKENS_PER_CHUNK = 2048  # Adjust as needed.  Keep it well below the model's max.
MODEL_NAME = "claude-3.5-sonnet-20240229"  # Or another appropriate model
BATCH_SIZE = 50  # Process this many concurrently

# --- Helper Functions ---

def load_gitignore(gitignore_path: str) -> list[str]:
    """Loads patterns from a .gitignore file."""
    patterns = []
    try:
        with open(gitignore_path, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    patterns.append(line)
    except FileNotFoundError:
        pass
    return patterns

def is_ignored(path: str, gitignore_patterns: list[str]) -> bool:
    """Checks if a path should be ignored based on .gitignore patterns."""
    for pattern in gitignore_patterns:
        if fnmatch.fnmatch(path, pattern):
            return True
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

    lines = content.splitlines()
    chunks = []
    current_chunk = []
    current_length = 0

    for line in lines:
        line_length = len(line) + 1
        if current_length + line_length <= max_tokens:
            current_chunk.append(line)
            current_length += line_length
        else:
            chunks.append("\n".join(current_chunk))
            current_chunk = [line]
            current_length = line_length
    if current_chunk:
        chunks.append("\n".join(current_chunk))

    return chunks

def create_requests(codebase_path: str, gitignore_patterns: list[str], max_tokens: int, prompt_template:str) -> list[dict]:
    """Creates a list of requests, chunking files and formatting prompts."""
    requests = []
    for root, _, files in os.walk(codebase_path):
        for file in files:
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, codebase_path)

            if not is_ignored(rel_path, gitignore_patterns):
                chunks = chunk_file(file_path, max_tokens)
                for i, chunk in enumerate(chunks):
                    prompt = prompt_template.format(file_path=rel_path, chunk_number=i + 1, total_chunks=len(chunks), code_chunk=chunk)
                    requests.append({
                        "model": MODEL_NAME,
                        "max_tokens": 1024,  # Adjust
                        "messages": [{"role": "user", "content": prompt}],
                    })
    return requests

async def send_single_request(client: anthropic.AsyncAnthropic, request_data: dict) -> str:
    """Sends a single request to the Anthropic API (async)."""
    try:
        message = await client.messages.create(**request_data)
        return message.content[0].text if message.content else ""
    except Exception as e:
        print(f"Error sending request: {e}")
        return ""

async def send_batch_requests(client: anthropic.AsyncAnthropic, requests: list[dict]) -> list[str]:
    """Sends requests concurrently using asyncio.gather."""
    tasks = [send_single_request(client, req) for req in requests]
    responses = await asyncio.gather(*tasks)  # Run concurrently
    return responses


# --- Main Script ---

async def main():  # Make main async
    if not ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY environment variable not set.")

    # Use the async client
    client = anthropic.AsyncAnthropic(api_key=ANTHROPIC_API_KEY)
    gitignore_patterns = load_gitignore(os.path.join(CODEBASE_PATH, ".gitignore"))

    prompt_template = """
    File: {file_path} (Chunk {chunk_number} of {total_chunks})

    Code:
    ```
    {code_chunk}
    ```

    Analyze the above code chunk.  Provide a brief summary of its purpose and functionality.
    """

    requests = create_requests(CODEBASE_PATH, gitignore_patterns, MAX_TOKENS_PER_CHUNK, prompt_template)

    all_responses = []
    for i in range(0, len(requests), BATCH_SIZE):
        batch = requests[i:i + BATCH_SIZE]
        responses = await send_batch_requests(client, batch) # Use await here
        all_responses.extend(responses)
        print(f"Processed batch {i // BATCH_SIZE + 1} of {(len(requests) + BATCH_SIZE - 1) // BATCH_SIZE}")

    for i, response in enumerate(all_responses):
        print(f"--- Response for Chunk {i + 1} ---")
        print(response)
        print("-" * 20)

    print("Finished processing")
    await client.close()  # Close the client

if __name__ == "__main__":
    asyncio.run(main()) # Run the async main function