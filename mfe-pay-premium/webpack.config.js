const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

const premiumPublicPath =
  process.env.MFE_PREMIUM_PUBLIC_PATH ||
  (process.env.DEPLOY_PRIME_URL && `${process.env.DEPLOY_PRIME_URL}/`) ||
  (process.env.NODE_ENV === 'production' ? 'https://insurance-premium.netlify.app/' : 'http://localhost:3002/');

module.exports = {
  entry: './src/index.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    publicPath: premiumPublicPath,
    clean: true,
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: { loader: 'babel-loader', options: { presets: ['@babel/preset-react'] } },
      },
      {
        test: /\.s?css$/i,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: { silenceDeprecations: ['legacy-js-api'] },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './public/index.html' }),
    new CopyPlugin({
      patterns: [{ from: 'public/_headers', to: '.' }],
    }),
    new ModuleFederationPlugin({
      name: 'payPremium',
      filename: 'remoteEntry.js',
      exposes: {
        './PayPremiumApp': './src/App.jsx',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.2.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
        'react-router-dom': { singleton: true, requiredVersion: '^6.20.0' },
        'shared-storage': { singleton: true, requiredVersion: '1.0.0' },
        '@mui/material': { singleton: true, requiredVersion: '^5.14.0' },
        '@mui/icons-material': { singleton: true, requiredVersion: '^5.14.0' },
        '@emotion/react': { singleton: true, requiredVersion: '^11.11.0' },
        '@emotion/styled': { singleton: true, requiredVersion: '^11.11.0' },
      },
    }),
  ],
  devServer: {
    port: 3002,
    historyApiFallback: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
};
