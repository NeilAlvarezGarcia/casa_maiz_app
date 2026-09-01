module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        path: '.env',
        // Only keys present in `.env` are importable; a reference to a missing
        // key fails at build time so configuration never silently falls back.
        safe: true,
        allowUndefined: false,
        quiet: true,
      },
    ],
  ],
};
