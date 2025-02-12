// app/api/news/route.test.ts (or .test.js)
import { GET } from './route'; // Import your GET handler
import { NextResponse } from 'next/server';

// Mock the rss-parser library
jest.mock('rss-parser', () => {
  return jest.fn().mockImplementation(() => {
    return {
      parseURL: jest.fn().mockResolvedValue({
        title: 'Mocked News Feed',
        items: [
          { title: 'Mocked Item 1', link: 'http://mock.com/1' },
          { title: 'Mocked Item 2', link: 'http://mock.com/2' },
        ],
      }),
    };
  });
});

describe('GET /api/news', () => {
  it('should return news items', async () => {
    const request = new Request('http://test.com/api/news'); // Dummy request object
    const response = await GET(request) as NextResponse;

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual([
      { title: 'Mocked Item 1', link: 'http://mock.com/1' },
      { title: 'Mocked Item 2', link: 'http://mock.com/2' },
    ]);
  });

    it('should return a 500 error if fetching fails', async() => {
        const mockError = new Error('Failed');
        const parser = require('rss-parser');
        parser.mockImplementation(() => {
          return {
            parseURL: jest.fn().mockRejectedValue(mockError)
          }
        });
        const request = new Request('http://test.com/api/news'); // Dummy request object
        const response = await GET(request) as NextResponse;
        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data).toEqual({ error: 'Failed to fetch data' });
    })
});