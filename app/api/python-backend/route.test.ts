// /home/ashben/www/html/tipics/nextjs-test-app/app/api/python-backend/route.test.ts
/**
 * @jest-environment node
 */

// Mock next/server *before* importing anything else
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      status: options?.status || 200, // Default to 200 if status isn't provided
      json: () => data, // Return the data directly
    })),
  },
}));

// Mock the fetch function
global.fetch = jest.fn();

describe('POST /api/python-backend', () => {
  let POST; // No type annotation needed

  beforeEach(async () => {
    (global.fetch as jest.Mock).mockClear();
    (jest.requireMock('next/server').NextResponse.json as jest.Mock).mockClear(); // Clear NextResponse.json mock

    // Dynamically import the route handler
    const route = await import('./route');
    POST = route.POST;
  });

  it('should forward data to the Python backend and return the response', async () => {
    const mockRequestBody = { input: 'test data' };
    const mockBackendResponse = { output: 'processed data' };

    // Mock the fetch call to return a successful response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockBackendResponse,
      text:  async () => JSON.stringify(mockBackendResponse),
      status: 200
    });

    const request = {
      json: async () => mockRequestBody,
    };

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockBackendResponse);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5002/api/local_process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockRequestBody),
    });
  });

  it('should handle errors from the Python backend', async () => {
    const mockRequestBody = { input: 'test data' };
    const mockErrorResponse = 'Internal Server Error';

    // Mock fetch to return an error response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => mockErrorResponse,
    });

      const request = {
        json: async () => mockRequestBody,
      };

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: `Python backend error: 500 - ${mockErrorResponse}` });
  });

  it('should handle communication errors', async () => {
      const mockRequestBody = { input: 'test data' };

      // Mock fetch to throw an error (e.g., network error)
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const request = {
          json: async () => mockRequestBody,
        };

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to communicate with Python backend' });
  });
});