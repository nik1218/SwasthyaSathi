const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for monorepo - watch the shared folder
config.watchFolders = [
  path.resolve(__dirname, '../shared'),
];

// Make sure Metro can resolve modules from the shared package
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '../node_modules'),
];

module.exports = config;
