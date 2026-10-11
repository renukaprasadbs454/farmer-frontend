const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Force CommonJS resolution for packages like zustand that include unbundled import.meta in ESM
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
