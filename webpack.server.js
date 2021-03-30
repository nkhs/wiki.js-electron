const webpack = require('webpack')
const path = require('path')
const yargs = require('yargs').argv
const _ = require('lodash')

const HtmlWebpackPugPlugin = require('html-webpack-pug-plugin')

const WebpackBarPlugin = require('webpackbar')

process.noDeprecation = true

module.exports = {
  mode: 'development',
  entry: './server/index.js',
  output: {
    path: path.join(process.cwd(), 'dist'),
    filename: 'main.js',
    globalObject: 'this',
    pathinfo: true,
    crossOriginLoading: 'use-credentials',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader!octal-number-loader',
        include: (modulePath) => {
          // console.log(modulePath)
          return modulePath.includes('node_modules\\tar')
        },
      },
      {
        test: /\.js$/,
        // exclude: (modulePath) => {
        //   return modulePath.includes('node_modules') && !modulePath.includes('vuetify')
        // },
        use: [
          {
            loader: 'babel-loader',
            options: {
              //   cacheDirectory: babelDir,
              // blacklist: ["useStrict"], 
            }
          }
        ],
        include: (modulePath) => {
          return !modulePath.includes('node_modules\\tar')
        },        
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.node$/,
        use: 'node-loader'
      },
      {
        loader: 'webpack-modernizr-loader',
        test: /\.modernizrrc\.js$/
      }
    ]
  },
  plugins: [
    new HtmlWebpackPugPlugin(),
    new WebpackBarPlugin({
      name: 'Server'
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      'process.env.CURRENT_THEME': JSON.stringify(_.defaultTo(yargs.theme, 'default'))
    })
  ],
  optimization: {
    // namedModules: true,
    // namedChunks: true,
    // splitChunks: {
    //   cacheGroups: {
    //     default: {
    //       minChunks: 2,
    //       priority: -20,
    //       reuseExistingChunk: true
    //     },
    //     vendor: {
    //       test: /[\\/]node_modules[\\/]/,
    //       minChunks: 2,
    //       priority: -10
    //     }
    //   }
    // },
    // runtimeChunk: 'single'
  },
  resolve: {
    mainFiles: ['index'],
    mainFields: ['main', 'module'],
    symlinks: true,
    extensions: [
      '.js',
      '.json',
      '.vue'
    ],
    modules: [
      'node_modules'
    ]
  },
  node: {
    __dirname: false,
    __filename: false
  },
  stats: {
    children: false,
    entrypoints: false
  },
  target: 'node',
  // watch: true
}
