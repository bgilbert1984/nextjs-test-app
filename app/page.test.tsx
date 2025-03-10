import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
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

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href} data-testid="mock-link">{children}</a>
  )
}));

describe('Page Component', () => {
  it('renders all components', () => {
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

  it('renders the Link component with correct href', () => {
    render(<Page />);
    const linkElement = screen.getByRole('link', { name: 'View Network Visualization' });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', '/network-visualization');
  });

  it('renders the Python script link', () => {
    render(<Page />);
    const linkElement = screen.getByRole('link', { name: 'Run Python Script' });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', '/api/hello');
  });
});