/**
 * Created by kevin on 7/25/17.
 */
const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');


const HtmlWebpackPluginConfigs = [new HtmlWebpackPlugin({
  template: './static/index.html',
  filename: './index.html',
  title: 'COVID-19 Cases Map',
  inject: 'body',
  chunks: ['index']
}),
new HtmlWebpackPlugin({
  template: './static/historical.html',
  filename: './historical.html',
  title: 'COVID-19 Cases Map',
  inject: 'body',
  chunks: ['historical']
})
];

const SRC_DIR = path.join(__dirname, "src");
const envOptions = {
  devtool: 'source-map',
  sourceMap: true,
  plugins: [...HtmlWebpackPluginConfigs,
    new ExtractTextPlugin({
      filename: "static/[name].css",
      allChunks: true
    }),
    new CopyWebpackPlugin([
      {from:'static/images', to:'static/images'} 
    ]),
    new CopyWebpackPlugin([
      {from:'static/css', to:'static/css'} 
    ]),
  ],
  outputDir: path.resolve('dist'),
};

if (process.env.NODE_ENV === 'production') {
  Object.assign(envOptions, {
    devtool: '',
    sourceMap: false,
    minimize: true,
    plugins: [...envOptions.plugins, 
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      //new webpack.optimize.UglifyJsPlugin()
    ],
    optimization: {
      minimize: true
    },
    outputDir: path.resolve('dist'),
  });
}
module.exports = {
  devtool: process.env.NODE_ENV === 'production'? '' : 'source-map',
  context: SRC_DIR,
  entry: {
    index: './static/index.js',
    historical: './static/historical.js'
  },
  output: {
    path: envOptions.outputDir,
    filename: 'static/[name].js',
    publicPath: '/'
  },
  module: {
    rules : [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/ },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [
            {
              loader: "css-loader",
              options: {
                global: true,
                importLoaders: 1,
                sourceMap: envOptions.sourceMap,
                localIdentName: 'o_[path]_[name]_[local]',
                module: true,
                camelCase: true,
                minimize: envOptions.minimize,
                getLocalIdent: (context, localIdentName, localName) => {
                  // We need to include this so that we can include the component folder
                  // name along with the file name and the css selector
                  // This is needed because we do not use hashes in there can be same
                  // css selector with same file name but in a folder component folder.
                  const splitPath = path.resolve(context.resourcePath).split('/');
                  const cssPath = splitPath.slice(Math.max(splitPath.length - 2, 1)).join('_').replace(/\.css$/, '');
                  return localIdentName
                    .replace(/\[local\]/gi, localName)
                    .replace(/\[path\]_\[name\]/gi, cssPath);
                },
              }
            }],
        }),

      },
      {
        test: /\.css$/,
        include: /node_modules/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [
            {
              loader: "css-loader",
              options: {
                global: true,
                importLoaders: 1,
                sourceMap: envOptions.sourceMap,
                module: false,
                camelCase: true,
                minimize: envOptions.minimize,
              }
            }],
        }),

      },
      { test: /\.(png|woff|woff2|eot|ttf|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader' }
    ]
  },
  plugins: envOptions.plugins,
}