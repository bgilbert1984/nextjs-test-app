// /home/ashben/www/html/tipics/nextjs-test-app/jest.config.js
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapper: {
    "^@/components/(.*)$": "<rootDir>/components/$1",
    "^@/(.*)$": "<rootDir>/app/$1"
  },
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  testEnvironment: 'jsdom', // Correct for component tests
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { // Correct ts-jest config
      tsconfig: 'tsconfig.json', // Use tsconfig.json
    }],
  },
  // NO globals section!
};