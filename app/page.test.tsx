// /home/ashben/www/html/tipics/nextjs-test-app/app/page.test.tsx
/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // For extended matchers
import Page from './page'; // Import the default export

// Mock the child components using ALIASES:
jest.mock('@/components/hero', () => () => <div data-testid="mock-hero">Mock Hero</div>);
jest.mock('@/components/SlateEditor', () => () => <div data-testid="mock-slate-editor">Mock SlateEditor</div>);
jest.mock('@/components/CrateTest', () => () => <div data-testid="mock-crate-test">Mock CrateTest</div>);
jest.mock('@/components/CaptivePortal', () => () => <div data-testid="mock-captive-portal">Mock CaptivePortal</div>);
jest.mock('@/components/WebSocketClient', () => () => <div data-testid="mock-websocket-client">Mock WebSocketClient</div>);

jest.mock('next/link', () => ({
  __esModule: true,
  default: jest.fn(({ href, children }) => (
    <a href={href} data-testid="mock-link">{children}</a> //Removed the generic testid
  )),
}));


describe('Page Component', () => {
  it('renders all components', () => {
    render(<Page />);

    // Use data-testid attributes for reliable querying.
    expect(screen.getByTestId('mock-hero')).toBeInTheDocument();
    expect(screen.getByTestId('mock-slate-editor')).toBeInTheDocument();
    expect(screen.getByTestId('mock-crate-test')).toBeInTheDocument();
    expect(screen.getByTestId('mock-captive-portal')).toBeInTheDocument();
    expect(screen.getByText('View Network Visualization')).toBeInTheDocument(); // Check link text
    expect(screen.getByText('Run Python Script')).toBeInTheDocument(); // Check link text
    expect(screen.getByTestId('mock-websocket-client')).toBeInTheDocument(); // Check for direct client

    expect(screen.getByText('WebSocket Example (Direct)')).toBeInTheDocument();
  });

    it('renders the Link component with correct href', () => {
      render(<Page />);
        const linkElement = screen.getByRole('link', { name: 'View Network Visualization' }); // Use getByRole
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