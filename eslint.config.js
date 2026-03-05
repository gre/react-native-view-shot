// ESLint v9 flat configuration
import js from "@eslint/js";
import prettier from "eslint-config-prettier";

export default [
  // Global ignores
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/lib/**",
      "**/.expo/**",
      "**/android/build/**",
      "**/android/app/build/**",
      "**/ios/build/**",
      "**/ios/Pods/**",
      "**/example-web/dist/**",
      "**/*.min.js",
    ],
  },
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
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^(React|View)$",
        },
      ],
      "no-console": "off",
      "prefer-const": "error",
      "no-var": "error",
    },
  },
  // Node.js files (metro.config.js, etc.)
  {
    files: [
      "**/metro.config.js",
      "**/babel.config.js",
      "**/webpack.config.js",
      "**/.detoxrc.js",
    ],
    languageOptions: {
      globals: {
        __dirname: "readonly",
        __filename: "readonly",
        process: "readonly",
        module: "readonly",
        exports: "readonly",
        require: "readonly",
      },
    },
  },
  // Jest test files
  {
    files: ["**/__tests__/**/*.js", "**/*.test.js", "**/e2e/**/*.js"],
    languageOptions: {
      globals: {
        // Jest globals
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        beforeEach: "readonly",
        afterAll: "readonly",
        afterEach: "readonly",
        jest: "readonly",
        // Detox globals
        device: "readonly",
        element: "readonly",
        by: "readonly",
        waitFor: "readonly",
        // Node.js globals for config files
        __dirname: "readonly",
        __filename: "readonly",
        process: "readonly",
        module: "readonly",
        exports: "readonly",
        require: "readonly",
      },
    },
  },
  // Web files
  {
    files: ["**/*.web.js"],
    languageOptions: {
      globals: {
        document: "readonly",
        window: "readonly",
      },
    },
  },
];
