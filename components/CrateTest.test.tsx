/**
 * @jest-environment jsdom
 */
// components/CrateTest.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import CrateTest from './CrateTest';
import { expect, jest, it, describe, beforeEach } from '@jest/globals';

global.fetch = jest.fn(); // Mock the global fetch function

describe('CrateTest', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear(); // Clear mock before each test

    // Default mock implementation (successful fetch)
    (global.fetch as jest.Mock).mockResolvedValue({
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
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<CrateTest />);

    await waitFor(() => {
      expect(screen.getByText('Error: HTTP error! status: 500')).toBeInTheDocument();
    });
  });

  it('renders error message on json failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockRejectedValue(new Error("Test Error"))
        });

        render(<CrateTest/>);


    await waitFor(() => {
      expect(screen.getByText("Error: Test Error")).toBeInTheDocument();
    });
  });
});