// __mocks__/pg.ts
const mockConnect = jest.fn();
const mockQuery = jest.fn();
const mockEnd = jest.fn();

const Client = jest.fn(() => ({
  connect: mockConnect,
  query: mockQuery,
  end: mockEnd,
}));

export { Client };