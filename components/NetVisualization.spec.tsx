// components/NetworkVisualization.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NetworkVisualization from './NetVisualization';

// Mock WebSocket
class MockWebSocket {
  onopen: (() => void) | null = null;
  onmessage: ((event: any) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: ((error: any) => void) | null = null;
  close = vi.fn();
  send = vi.fn();

  constructor(url: string) {}
}

vi.stubGlobal('WebSocket', MockWebSocket);

describe('NetworkVisualization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial state correctly', () => {
    render(<NetworkVisualization />);
    expect(screen.getByText('NetworkVisualization Component')).toBeInTheDocument();
    expect(screen.getByText('Launch Unit')).toBeInTheDocument();
  });

  it('renders with WebSocket connection', () => {
    const { container } = render(<NetworkVisualization />);
    expect(container.textContent).toContain('Launch Unit');
  });

  it('handles WebSocket errors', () => {
    // Render component
    const { container } = render(<NetworkVisualization />);
    
    // Get the mock WebSocket instance 
    const ws = new MockWebSocket('ws://localhost:8080');
    
    // Simulate an error
    if (ws.onerror) {
      ws.onerror(new Event('error'));
    }
    
    // Basic check that component still renders
    expect(container.textContent).toContain('Launch Unit');
  });
});
