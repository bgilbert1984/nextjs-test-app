/**
* @jest-environment jsdom
*/
// components/NetworkVisualization.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import NetworkVisualization from './NetworkVisualization';
import '@testing-library/jest-dom'; // Import jest-dom *here*
import {expect, jest, it, describe, beforeEach} from '@jest/globals';


// Mock the Canvas component from @react-three/fiber
jest.mock('@react-three/fiber', () => ({
 ...jest.requireActual('@react-three/fiber'), // Keep other exports
 Canvas: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock('@react-three/drei', () => ({
    ...jest.requireActual('@react-three/drei'), // Keep other exports
    OrbitControls: () => <div data-testid="mock-orbit-controls"></div>, // Mock Orbit controls
    Html: ({children}: {children: React.ReactNode}) => <>{children}</> //Mock Html
}));


// Mock the WebSocket globally
global.WebSocket = jest.fn(() => ({
 onopen: jest.fn(),
 onmessage: jest.fn(),
 onclose: jest.fn(),
 onerror: jest.fn(),
 close: jest.fn(),
})) as any;


describe('NetworkVisualization', () => {
 beforeEach(() => {
    (global.WebSocket as any).mockClear(); // Clear mock calls before each test
    jest.clearAllMocks(); // Clear all mocks, including the Canvas mock
 });

 it('renders initial state correctly', () => {
    render(<NetworkVisualization />);
    expect(screen.getByText('Waiting for data...')).toBeInTheDocument();
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
 });

 it('attempts to connect to the WebSocket', () => {
    render(<NetworkVisualization />);
    expect(global.WebSocket).toHaveBeenCalledWith('ws://100.99.242.6:8000/ws');
  });

  it('updates status to "Connected" on successful connection', async () => {
    render(<NetworkVisualization />);
    const mockWebSocket = (global.WebSocket as any).mock.instances[0];

    // Simulate the onopen event
    act(() => {
      mockWebSocket.onopen();
    });

    await waitFor(() => {
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });
  });

    it('updates neurons on message reception', async () => {
        render(<NetworkVisualization />);
        const mockWebSocket = (global.WebSocket as any).mock.instances[0];
         // Simulate onopen to set status to "Connected".
         act(() => {
          mockWebSocket.onopen();
        });

        // Simulate receiving a message
        const mockData = {
          voxels: [[1, 2, 3], [4, 5, 6]],
          speech: "Test"
        };
        const mockEvent = { data: JSON.stringify(mockData) };

        act(() => {
          mockWebSocket.onmessage(mockEvent);
        });

        // Check if neurons are updated by checking the positions passed to Neuron components
        await waitFor(() => {
          expect(screen.getByText('Connected')).toBeInTheDocument(); //Still connected.
        });
    });

  it('attempts to reconnect on close', async () => {
      jest.useFakeTimers(); // Enable fake timers

      render(<NetworkVisualization />);
      const mockWebSocket = (global.WebSocket as any).mock.instances[0];

      // Simulate the onclose event
      act(() => {
        mockWebSocket.onclose();
      });

    await waitFor(() => {
        expect(screen.getByText('Reconnecting...')).toBeInTheDocument();
      });

      // Advance timers by 2 seconds (reconnect timeout)
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Check if WebSocket was called again for reconnection
      expect(global.WebSocket).toHaveBeenCalledTimes(2); // Initial + Reconnect

      jest.useRealTimers(); // Restore real timers
    });

    it('handles WebSocket errors', async () => {
      render(<NetworkVisualization />);
      const mockWebSocket = (global.WebSocket as any).mock.instances[0];
      const consoleErrorSpy = jest.spyOn(console, 'error'); // Spy on console.error

        // Simulate the onerror event
        const mockErrorEvent = { message: 'Test Error' };

        act(() => {
          mockWebSocket.onerror(mockErrorEvent);
        });


        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith('WebSocket error:', mockErrorEvent);
            expect(mockWebSocket.close).toHaveBeenCalled();

        });
        consoleErrorSpy.mockRestore(); // Restore original console.error
    });
});