const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const os = require('os');

const config = {
  maxWorkers: Math.max(1, Math.floor(os.cpus().length / 2)),

  transformer: {
    getTransformOptions: async () => ({
      transform: {
        inlineRequires: true, //  huge speed boost
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);