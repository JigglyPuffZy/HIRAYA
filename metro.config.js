const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const duplicateRouteBlockList = [
  'profile',
  'dashboard',
  'assessment',
  'history',
  'weather',
  'settings',
].map(
  (segment) =>
    new RegExp(`[\\\\/]app[\\\\/]${segment}(?:[\\\\/]index)?\\.tsx$`),
);

// OneDrive/Windows sometimes drops desktop.ini into node_modules, which crashes Metro.
// Also block legacy duplicate routes outside the (app) group if OneDrive restores them.
config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList)
    ? config.resolver.blockList
    : config.resolver.blockList
      ? [config.resolver.blockList]
      : []),
  /desktop\.ini$/,
  /Thumbs\.db$/,
  ...duplicateRouteBlockList,
];

module.exports = config;
