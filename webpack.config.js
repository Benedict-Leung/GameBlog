const path = require('path');

module.exports = {
  entry: {
    index: {
        import: './public/js/client.js',
        dependOn: 'shared',
    },
    shared: 'three'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  }
};