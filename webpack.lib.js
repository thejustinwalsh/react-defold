const path = require('path');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: "umd",
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