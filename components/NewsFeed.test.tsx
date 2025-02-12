// components/NewsFeed.test.tsx (or .test.js)
import { render, screen, waitFor } from '@testing-library/react';
import NewsFeed from './NewsFeed';
import { expect, jest, it, describe } from '@jest/globals';


global.fetch = jest.fn(); // Mock the global fetch function

describe('NewsFeed', () => {
  it('renders loading state initially', () => {
    render(<NewsFeed />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders news items on successful fetch', async () => {
    const mockNews = [
      { title: 'Test Item 1', link: 'http://example.com/1', _id: '1' },
      { title: 'Test Item 2', link: 'http://example.com/2', _id: '2' },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockNews,
    });

    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
      expect(screen.getByText('Test Item 2')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Test Item 1' })).toHaveAttribute('href', 'http://example.com/1');
    });
  });

  it('renders error message on fetch failure', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false, // Simulate an HTTP error
      status: 500,
    });

    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText('Error: HTTP error! status: 500')).toBeInTheDocument();
    });
  });
});