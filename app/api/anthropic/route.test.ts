import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

// Mock the fetch API
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Anthropic API Route', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    // Properly spy on console.error
    vi.spyOn(console, 'error');
  });

  afterEach(() => {
    // Restore all mocks after tests
    vi.restoreAllMocks();
  });

  it('returns a successful response when the Rust backend returns valid data', async () => {
    // Mock successful response from Rust backend
    const mockResponseData = { response: 'This is a response from Claude' };
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponseData)
    });

    // Create mock request
    const request = new NextRequest('http://localhost:3000/api/anthropic', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello Claude' }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Call the handler
    const response = await POST(request);
    const responseData = await response.json();

    // Assertions
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/api/ask-claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'Hello Claude' }),
    });
    expect(response.status).toBe(200);
    expect(responseData).toEqual({ response: 'This is a response from Claude' });
  });

  it('returns an error response when the Rust backend returns an error', async () => {
    // Mock error response from Rust backend
    const mockErrorData = { error: 'Failed to process request' };
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve(mockErrorData)
    });

    // Create mock request
    const request = new NextRequest('http://localhost:3000/api/anthropic', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello Claude' }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Call the handler
    const response = await POST(request);
    const responseData = await response.json();

    // Assertions
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(400);
    expect(responseData).toEqual({ error: 'Failed to process request' });
  });

  it('handles network errors when calling the Rust backend', async () => {
    // Mock network error
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    // Create mock request
    const request = new NextRequest('http://localhost:3000/api/anthropic', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello Claude' }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Call the handler
    const response = await POST(request);
    const responseData = await response.json();

    // Assertions
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalled();
    expect(response.status).toBe(500);
    expect(responseData).toEqual({ error: 'Failed to fetch from Rust backend' });
  });

  it('handles invalid JSON in the request body', async () => {
    // Create a request with a body that will cause JSON.parse to fail
    const invalidRequest = {
      json: () => Promise.reject(new Error('Invalid JSON')),
    } as unknown as Request;

    // Call the handler
    const response = await POST(invalidRequest);
    const responseData = await response.json();

    // Assertions
    expect(console.error).toHaveBeenCalled();
    expect(response.status).toBe(500);
    expect(responseData).toEqual({ error: 'Failed to fetch from Rust backend' });
  });
});