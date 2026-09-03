module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    // React is not required in scope: these files use TypeScript's JSX
    // transform and the @react-native/babel-preset automatic runtime.
    'react/react-in-jsx-scope': 'off',
  },
  overrides: [
    {
      files: [
        '**/*.test.{ts,tsx}',
        '**/__tests__/**/*.{ts,tsx}',
        'jest.setup.js',
      ],
      env: {
        jest: true,
      },
    },
  ],
};
