const path = require('path');

module.exports = {
  entry: './src/app/index.ts',
  mode: 'development',
  devServer: {
    watchFiles: ["src/**/*"],
    //port: 3000,
    hot: true,
    compress: true,
    //open: "Chrome",
    static: path.join(__dirname, "./dist"),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        include: [path.resolve(__dirname, 'src')],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
};