module.exports.getWebpackConfig = (config, options) => ({
  ...config,
  externals: config.externals.filter(ext => ext != 'd3')
});
