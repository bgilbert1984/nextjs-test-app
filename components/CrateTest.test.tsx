// components/CrateTest.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import CrateTest from './CrateTest';

// Mock the fetch function
beforeEach(() => {
  vi.resetAllMocks();
  
  // Clear localStorage mocks
  global.fetch = vi.fn();
});

describe('CrateTest', () => {
  it('renders loading state initially', async () => {
    render(<CrateTest />);
    // Use getByText for initial loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders CrateDB items on successful fetch', async () => {
    // Mock successful fetch response
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        data: [
          { id: 1, name: 'Test Item 1', created_at: '2024-02-13T12:00:00.000Z' },
          { id: 2, name: 'Test Item 2', created_at: '2024-02-13T13:00:00.000Z' }
        ]
      })
    });

    render(<CrateTest />);

    // Use waitFor to wait for the data to appear
    await waitFor(() => {
      expect(screen.getByText('Test Item 1 - 2024-02-13T12:00:00.000Z')).toBeInTheDocument();
      expect(screen.getByText('Test Item 2 - 2024-02-13T13:00:00.000Z')).toBeInTheDocument();
    });
  });

  it('renders error message on fetch failure', async () => {
    // Mock fetch with HTTP error
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    render(<CrateTest />);

    await waitFor(() => {
      expect(screen.getByText('Error: HTTP error! status: 500')).toBeInTheDocument();
    });
  });

  it('renders error message on json failure', async () => {
    // Mock fetch with JSON error
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => { throw new Error('Test Error'); }
    });

    render(<CrateTest />);

    await waitFor(() => {
      expect(screen.getByText('Error: Test Error')).toBeInTheDocument();
    });
  });

  it('renders without crashing', async () => {
    // Mock successful fetch response
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        data: [
          { id: 1, name: 'Test Item 1', created_at: '2024-02-13T12:00:00.000Z' },
        ]
      })
    });
    
    render(<CrateTest />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Test Item 1 - 2024-02-13T12:00:00.000Z')).toBeInTheDocument();
    });
  });

  it('renders no items when fetch returns empty array', async () => {
    // Mock successful fetch with empty array
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] })
    });

    render(<CrateTest />);

    await waitFor(() => {
      // Check for empty list message
      expect(screen.getByText('No items found')).toBeInTheDocument();
    });
  });

  it('renders multiple items correctly', async () => {
    // Mock successful fetch with multiple items
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        data: [
          { id: 1, name: 'Test Item 1', created_at: '2024-02-13T12:00:00.000Z' },
          { id: 2, name: 'Test Item 2', created_at: '2024-02-13T13:00:00.000Z' },
          { id: 3, name: 'Test Item 3', created_at: '2024-02-13T14:00:00.000Z' }
        ]
      })
    });

    render(<CrateTest />);

    await waitFor(() => {
      expect(screen.getByText('Test Item 1 - 2024-02-13T12:00:00.000Z')).toBeInTheDocument();
      expect(screen.getByText('Test Item 2 - 2024-02-13T13:00:00.000Z')).toBeInTheDocument();
      expect(screen.getByText('Test Item 3 - 2024-02-13T14:00:00.000Z')).toBeInTheDocument();
    });
  });

  it('handles network error gracefully', async () => {
    // Mock network error
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network Error'));

    render(<CrateTest />);

    await waitFor(() => {
      expect(screen.getByText('Error: Network Error')).toBeInTheDocument();
    });
  });
});