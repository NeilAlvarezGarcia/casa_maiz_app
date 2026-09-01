module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['**/*.test.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}', 'jest.setup.js'],
      env: {
        jest: true,
      },
    },
  ],
};
