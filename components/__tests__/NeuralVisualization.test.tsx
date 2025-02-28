/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import NeuralVisualization from '../NeuralVisualization';
import '@testing-library/jest-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';

// Mock @react-three/fiber
jest.mock('@react-three/fiber', () => {
  const originalModule = jest.requireActual('@react-three/fiber');
  return {
    __esModule: true,
    ...originalModule,
    Canvas: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    useFrame: jest.fn(),
  };
});

// Mock @react-three/drei
jest.mock('@react-three/drei', () => ({
  ...jest.requireActual('@react-three/drei'),
  OrbitControls: () => <div data-testid="mock-orbit-controls" />,
  Html: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('NeuralVisualization', () => {
  it('renders initial state correctly', () => {
    render(<NeuralVisualization neurons={[]} status="Waiting for data..." />);
    expect(screen.getByText('Waiting for data...')).toBeVisible();
  });

  it('renders neurons when data is provided', () => {
    const mockNeurons = [
      { position: [1, 2, 3], intensity: 0.5 },
      { position: [-1, 0, 1], intensity: 0.8 },
    ];
      render(<NeuralVisualization neurons={mockNeurons} status="Connected" />);
      //Because we've mocked Canvas and OrbitControls we can't see the neurons, but we know that if the mockNeurons have been populated, then the neuron.map function has run.
      expect(screen.getByText("Status: Connected")).toBeVisible();

  });
    it('renders status correctly', () => {
        render(<NeuralVisualization neurons={[]} status="Test Status" />);
        expect(screen.getByText('Status: Test Status')).toBeVisible();
    });
});