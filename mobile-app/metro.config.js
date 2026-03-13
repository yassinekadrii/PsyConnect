const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable package exports for better ESM support in node_modules (required for some libraries on web)
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
