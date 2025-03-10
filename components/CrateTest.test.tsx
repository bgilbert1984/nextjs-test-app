import { render, screen, waitFor } from '@testing-library/react';
import CrateTest from './CrateTest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest'; // This is crucial for toBeInTheDocument()

global.fetch = vi.fn(); // Mock the global fetch function

describe('CrateTest', () => {
  beforeEach(() => {
    (global.fetch as vi.Mock).mockClear(); // Clear mock before each test

    // Default mock implementation (successful fetch)
    (global.fetch as vi.Mock).mockResolvedValue({
      ok: true,
      json: async () => [
        { id: 1, name: 'Test Item 1', created_at: '2024-02-13T12:00:00.000Z' },
        { id: 2, name: 'Test Item 2', created_at: '2024-02-13T13:00:00.000Z' },
      ],
    });
  });

  it('renders loading state initially', async () => {
    render(<CrateTest />);
    // Use findByText for initial loading state
    expect(await screen.findByText('Loading...')).toBeInTheDocument();
  });

  it('renders CrateDB items on successful fetch', async () => {
    render(<CrateTest />); // Render

    // Use waitFor to wait for the data to appear
    await waitFor(() => {
      expect(screen.getByText('Test Item 1 - 2024-02-13T12:00:00.000Z')).toBeInTheDocument();
      expect(screen.getByText('Test Item 2 - 2024-02-13T13:00:00.000Z')).toBeInTheDocument();
    });
  });

  it('renders error message on fetch failure', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<CrateTest />);

    await waitFor(() => {
      expect(screen.getByText('Error: HTTP error! status: 500')).toBeInTheDocument();
    });
  });

  it('renders error message on json failure', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockRejectedValue(new Error("Test Error"))
    });

    render(<CrateTest />);

    await waitFor(() => {
      expect(screen.getByText("Error: Test Error")).toBeInTheDocument();
    });
  });

  it('renders without crashing', async () => {
    render(<CrateTest />);
    expect(screen.getByText('Loading...')).toBeInTheDocument(); // First check loading state
    await waitFor(() => {
      expect(screen.getByText('Test Item 1 - 2024-02-13T12:00:00.000Z')).toBeInTheDocument();
    });
  });

  it('renders no items when fetch returns empty array', async () => {
    // Mock successful fetch with empty data array
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<CrateTest />);

    await waitFor(() => {
      // Check for empty list instead of a specific message
      const list = screen.getByRole('list'); // Find the <ul> element
      expect(list).toBeInTheDocument();
      expect(list.children).toHaveLength(0); // Verify it has no child elements
    });
  });

  it('renders multiple items correctly', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, name: 'Test Item 1', created_at: '2024-02-13T12:00:00.000Z' },
        { id: 2, name: 'Test Item 2', created_at: '2024-02-13T13:00:00.000Z' },
        { id: 3, name: 'Test Item 3', created_at: '2024-02-13T14:00:00.000Z' },
      ],
    });

    render(<CrateTest />);

    await waitFor(() => {
      expect(screen.getByText('Test Item 1 - 2024-02-13T12:00:00.000Z')).toBeInTheDocument();
      expect(screen.getByText('Test Item 2 - 2024-02-13T13:00:00.000Z')).toBeInTheDocument();
      expect(screen.getByText('Test Item 3 - 2024-02-13T14:00:00.000Z')).toBeInTheDocument();
    });
  });

  it('handles network error gracefully', async () => {
    (global.fetch as vi.Mock).mockRejectedValueOnce(new Error('Network Error'));

    render(<CrateTest />);

    await waitFor(() => {
      expect(screen.getByText('Error: Network Error')).toBeInTheDocument();
    });
  });
});