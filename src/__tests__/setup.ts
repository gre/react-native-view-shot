// Ensure __DEV__ is available globally
(globalThis as any).__DEV__ = true;

// Setup for react-test-renderer with React 19
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
