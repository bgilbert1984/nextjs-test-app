// app/api/cratedb/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/server with both NextRequest and NextResponse
vi.mock('next/server', async () => {
  // Use importActual to get the original NextRequest implementation
  const actual = await vi.importActual('next/server');
  
  return {
    ...actual, // Include all original exports
    NextResponse: {
      json: vi.fn((data, options) => ({ data, options }))
    }
  };
});

// Mock node-crate before importing
vi.mock('node-crate', () => ({
  default: {
    connect: vi.fn(),
    execute: vi.fn(),
    close: vi.fn()
  }
}));

// Now import after mocks are set up
import { GET, POST } from './route';
import { NextRequest, NextResponse } from 'next/server';
import crate from 'node-crate';

describe('CrateDB API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return data on successful GET request', async () => {
    // Mock the successful response
    const mockData = [
      { id: 1, name: 'Test Item' },
      { id: 2, name: 'Another Item' },
    ];
    
    vi.mocked(crate.execute).mockResolvedValueOnce({
      rows: mockData,
      rowCount: mockData.length,
      duration: 10,
    });

    // Create a mock request
    const request = new Request('http://localhost/api/cratedb');
    
    // Call the endpoint
    await GET(request);

    // Verify the database was queried
    expect(crate.execute).toHaveBeenCalledWith('SELECT * FROM doc.mytable ORDER BY created_at DESC');
    
    // Verify the response was correct
    expect(NextResponse.json).toHaveBeenCalledWith({ data: mockData });
  });

  it('should handle errors in the GET request', async () => {
    // Mock a database error
    vi.mocked(crate.execute).mockRejectedValueOnce(new Error('Database error'));

    // Create a mock request
    const request = new Request('http://localhost/api/cratedb');
    
    // Call the endpoint
    await GET(request);
    
    // Verify the error handling
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  });

  it('should not allow POST requests', async () => {
    // Create a mock POST request
    const request = new Request('http://localhost/api/cratedb', {
      method: 'POST',
      body: JSON.stringify({ query: 'SELECT COUNT(*) as count FROM table' }),
    });
    
    // Call the endpoint
    await POST(request);
    
    // Verify the response is a method not allowed error
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Method Not Allowed" },
      { status: 405 }
    );
  });
});