import { describe, it, expect, vi, beforeEach } from 'vitest';

// Import the mocked module
import mockCrate from './__mocks__/node-crate';

// Mock next/server before any imports
vi.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: { status?: number }) => ({
      ...data,
      status: init?.status || 200
    })
  }
}));

// Mock node-crate using the mock module
vi.mock('node-crate', () => ({
  default: mockCrate
}));

// Import after mocks are defined
import { GET } from '../../../app/api/cratedb/route';

describe('CrateDB API Route', () => {
  const mockData = [
    { id: 1, name: 'Test Item 1', created_at: '2024-02-14' },
    { id: 2, name: 'Test Item 2', created_at: '2024-02-14' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch data from CrateDB and return a 200 response', async () => {
    mockCrate.execute.mockResolvedValueOnce({ rows: mockData });

    const request = new Request('http://localhost:3000/api/cratedb', { method: 'GET' });
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    expect(mockCrate.execute).toHaveBeenCalled();
  });

  it('should return a 500 error if fetching data fails', async () => {
    mockCrate.execute.mockRejectedValueOnce(new Error('Database error'));

    const request = new Request('http://localhost:3000/api/cratedb', { method: 'GET' });
    const response = await GET(request);
    
    expect(response.status).toBe(500);
  });

  it('should return a 405 error if the method is invalid', async () => {
    const request = new Request('http://localhost:3000/api/cratedb', {
      method: 'POST'
    });
    
    const response = await GET(request);
    expect(response.status).toBe(405);
  });
});