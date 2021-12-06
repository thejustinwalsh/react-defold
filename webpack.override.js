module.exports = (webpackConfig, env) => {
  return { ...webpackConfig,
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
  };
};