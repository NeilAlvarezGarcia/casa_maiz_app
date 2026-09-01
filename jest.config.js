module.exports = {
  preset: 'react-native',
  setupFiles: ['./jest.setup.js'],
  moduleNameMapper: {
    '^@testing-library/react-native$':
      '<rootDir>/node_modules/@testing-library/react-native',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-safe-area-context|react-native-screens|@react-native-async-storage)/)',
  ],
};
