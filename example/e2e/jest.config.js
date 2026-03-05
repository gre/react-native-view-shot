module.exports = {
  rootDir: '..',
  testMatch: ['<rootDir>/e2e/tests/**/*.test.js', '<rootDir>/e2e/**/*.test.js'],
  testTimeout: 180000, // Increased for comprehensive tests
  maxWorkers: 1,
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: [
    'detox/runners/jest/reporter',
    [
      'jest-junit',
      {
        outputDirectory: 'e2e/test-results',
        outputName: 'detox-results.xml',
        suiteName: 'ViewShot E2E Tests',
      },
    ],
  ],
  testEnvironment: 'detox/runners/jest/testEnvironment',
  verbose: true,
  bail: false, // Continue running tests even if some fail
  collectCoverage: false, // E2E tests don't need code coverage
  setupFilesAfterEnv: ['<rootDir>/e2e/setup.js'],
};
