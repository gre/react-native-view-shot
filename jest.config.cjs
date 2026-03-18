/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  testMatch: ["**/__tests__/**/*.test.ts?(x)"],
  globals: {
    __DEV__: true,
  },
  setupFiles: ["<rootDir>/src/__tests__/setup.ts"],
  moduleNameMapper: {
    "^react-native$": "<rootDir>/src/__tests__/__mocks__/react-native.ts",
  },
};
