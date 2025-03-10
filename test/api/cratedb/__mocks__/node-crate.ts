import { vi } from 'vitest';

const mockExecute = vi.fn();
const mockClose = vi.fn();
const mockConnect = vi.fn();

export default {
  execute: mockExecute,
  close: mockClose,
  connect: mockConnect
};