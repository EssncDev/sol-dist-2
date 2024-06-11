const webpack = require('webpack');

module.exports = function override(config, env) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('crypto-browserify'),
    zlib: require.resolve("browserify-zlib"),
    url: require.resolve("url/"),
    https: require.resolve("https-browserify"),
    http: require.resolve("stream-http")
  };

  return config;
};