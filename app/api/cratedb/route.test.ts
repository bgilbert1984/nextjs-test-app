// /home/ashben/www/html/tipics/nextjs-test-app/app/api/cratedb/route.test.ts
import { NextResponse, NextRequest } from 'next/server';
import {expect, it, describe, beforeEach, jest} from '@jest/globals';
import '@testing-library/jest-dom';
import { Client } from 'pg'; // Import the Client type!

// Mock next/server (no changes here)
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options: { status?: number } = {}) => ({
      status: options.status || 200,
      json: () => Promise.resolve(data),
    })),
  },
  //Don't mock NextRequest
}));

// Simplified Mock for the 'pg' Client - NO explicit types here
jest.mock('pg', () => {
  const mClient = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Client: jest.fn(() => mClient) };
});

describe('GET /api/cratedb', () => {
  let mockClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Get the mocked Client constructor.  No complex casting needed!
    const MockClientConstructor = jest.requireMock('pg').Client;
    mockClient = new MockClientConstructor();

    // Default mock behavior for query (CrateDB-compatible response)
        (mockClient.query as jest.Mock).mockResolvedValue({
      rows: [
        { id: '1', name: 'Crate Item 1', created_at: '2024-02-14T12:00:00.000Z' }, // id as string
        { id: '2', name: 'Crate Item 2', created_at: '2024-02-14T13:00:00.000Z' }, // id as string
      ],
      rowCount: 2, // CrateDB *does* return rowCount
      // NO fields, command, or oid
    });
  });

  it('should fetch data from CrateDB and return a 200 response', async () => {
    const {GET} = await import('./route'); // Dynamic import here
    const request = new NextRequest(new URL('http://test.com/api/cratedb'));
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    if (data.length > 0) {
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('name');
      expect(data[0]).toHaveProperty('created_at');
    }
   });

    it('should return a 500 error if fetching data fails', async () => {
        // Mock the query to reject *within* the test case.
        (mockClient.query as jest.Mock).mockRejectedValue(new Error('Mocked CrateDB error'));

        const {GET} = await import('./route');
        const request = new NextRequest(new URL('http://test.com/api/cratedb'));
        const response = await GET(request);

        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data).toHaveProperty('error');
    });
    it('should return a 405 error if the method is invalid', async () => {
        const {GET} = await import('./route');
        const request = new NextRequest(new URL('http://test.com/api/cratedb'), {method: 'POST'});
        const response = await GET(request); //GET method is not allowed for POST requests
        expect(response.status).toBe(405);
    });
});