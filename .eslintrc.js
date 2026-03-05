// ESLint v9 flat configuration
import js from "@eslint/js";
import prettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  prettier,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        __DEV__: "readonly",
        console: "readonly",
        global: "readonly",
        globalThis: "readonly",
        process: "readonly",
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        // React Native globals
        fetch: "readonly",
        FormData: "readonly",
        navigator: "readonly",
        XMLHttpRequest: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["error", {argsIgnorePattern: "^_"}],
      "no-console": "off",
      "prefer-const": "error",
      "no-var": "error",
    },
  },
];
