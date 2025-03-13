import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { test, expect, vi, describe, beforeEach } from 'vitest';
import Page from './page';

// Mock the child components using Vitest
vi.mock('@/components/hero', () => ({
  default: () => <div data-testid="mock-hero">Mock Hero</div>
}));

vi.mock('@/components/SlateEditor', () => ({
  default: () => <div data-testid="mock-slate-editor">Mock SlateEditor</div>
}));

vi.mock('@/components/CrateTest', () => ({
  default: () => <div data-testid="mock-crate-test">Mock CrateTest</div>
}));

vi.mock('@/components/CaptivePortal', () => ({
  default: () => <div data-testid="mock-captive-portal">Mock CaptivePortal</div>
}));

vi.mock('@/components/WebSocketClient', () => ({
  default: () => <div data-testid="mock-websocket-client">Mock WebSocketClient</div>
}));

// Mock dynamic imports
vi.mock('next/dynamic', () => ({
  default: () => {
    return function DynamicComponent() {
      return <div data-testid="mock-dynamic-component">Mock Dynamic Component</div>;
    };
  }
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href} data-testid="mock-link">{children}</a>
  )
}));

// Mock fetch for Claude API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Page Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders all components', () => {
    render(<Page />);
    expect(screen.getByTestId('mock-hero')).toBeInTheDocument();
    expect(screen.getByTestId('mock-slate-editor')).toBeInTheDocument();
    expect(screen.getByTestId('mock-crate-test')).toBeInTheDocument();
    expect(screen.getByTestId('mock-captive-portal')).toBeInTheDocument();
    expect(screen.getByText('View Network Visualization')).toBeInTheDocument();
    expect(screen.getByText('Run Python Script')).toBeInTheDocument();
    expect(screen.getByTestId('mock-websocket-client')).toBeInTheDocument();
    expect(screen.getByText('WebSocket Example (Direct)')).toBeInTheDocument();
  });

  test('renders the Claude chat interface', () => {
    render(<Page />);
    expect(screen.getByText('Ask Claude')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your message for Claude...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send to Claude' })).toBeInTheDocument();
  });

  test('handles successful Claude API call', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ response: 'Test response from Claude' }),
    });

    render(<Page />);
    const textarea = screen.getByPlaceholderText('Enter your message for Claude...');
    const submitButton = screen.getByRole('button', { name: 'Send to Claude' });

    fireEvent.change(textarea, { target: { value: 'Test prompt' } });
    fireEvent.click(submitButton);

    expect(submitButton).toHaveTextContent('Sending...');
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText('Claude\'s Response:')).toBeInTheDocument();
      expect(screen.getByText('Test response from Claude')).toBeInTheDocument();
      expect(submitButton).toHaveTextContent('Send to Claude');
      expect(submitButton).not.toBeDisabled();
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/anthropic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Test prompt' }),
    });
  });

  test('handles API error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'API Error' }),
    });

    render(<Page />);
    const textarea = screen.getByPlaceholderText('Enter your message for Claude...');
    const submitButton = screen.getByRole('button', { name: 'Send to Claude' });

    fireEvent.change(textarea, { target: { value: 'Test prompt' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });
  });

  test('renders the Link component with correct href', () => {
    render(<Page />);
    const linkElement = screen.getByRole('link', { name: 'View Network Visualization' });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', '/network-visualization');
  });

  test('renders the Python script link', () => {
    render(<Page />);
    const linkElement = screen.getByRole('link', { name: 'Run Python Script' });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', '/api/hello');
  });
});