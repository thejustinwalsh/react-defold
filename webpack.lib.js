const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './src/index.ts',
  target: 'node',
  externals: [nodeExternals()],
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist/cjs'),
    libraryTarget: "commonjs2",
    library: "react-defold"
  },
  resolve: {
    extensions: ['.ts', '.js', '.tsx', 'jsx'],
  },
  module: {
    rules: [
      {
        test: [/\.m?jsx?$/, /\.tsx?$/],
        exclude: /node_modules/,
        use: {
          loader: "swc-loader"
        }
      },
    ]
  }
}