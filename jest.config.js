// jest.config.js
module.exports = {
    testEnvironment: 'jsdom', // Important for React component testing
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // Optional setup file
    testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/$1', // Adjust if your paths are different.
    },
    transform: {
      // Use babel-jest to transpile tests with the next/babel preset
      // https://jestjs.io/docs/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object
      '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  };