const path = require('path');
const pkg = require('./package.json');
var nodeExternals = require('webpack-node-externals');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

process.env.NODE_ENV = 'production';
const isEnvProduction = process.env.NODE_ENV === 'production';
const isEnvDevelopment = process.env.NODE_ENV === 'development';

const jsConfig = {
  mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
  devtool: isEnvProduction ? 'source-map' : 'cheap-module-source-map',
  node: { 
    module: 'empty',
    dgram: 'empty',
    dns: 'mock',
    fs: 'empty',
    http2: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },
  entry: './src/index.js',
  resolve: {
    modules: [path.resolve('./node_modules'), path.resolve('./src')],
    extensions: [
      '.web.mjs',
      '.mjs',
      '.web.js',
      '.js',
      '.web.ts',
      '.ts',
      '.web.tsx',
      '.tsx',
      '.json',
      '.web.jsx',
      '.jsx',
    ]
  },
  optimization: {
    minimizer: [
      new TerserPlugin(),
    ],
  },
  plugins: [],
  module: {
    rules: [
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  }
}

const getStyleLoaders = () => [
  isEnvProduction && {
    loader: MiniCssExtractPlugin.loader,
  },
  {
    loader: require.resolve('css-loader'),
    options: {
      importLoaders: 1,
      sourceMap: isEnvProduction
    }
  },
  {
    loader: require.resolve('sass-loader'),
    options: {
      sourceMap: isEnvProduction,
    },
  }
]

if (isEnvDevelopment) {
 getStyleLoaders.push(require.resolve('style-loader')) 
}

const cssConfig = {
  mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
  node: { 
    module: 'empty',
    dgram: 'empty',
    dns: 'mock',
    fs: 'empty',
    http2: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },
  entry: {
    fullViewLayout: './src/styles/FullViewLayout.scss',
    compactLayout: './src/styles/CompactLayout.scss',
  },
  resolve: {
    modules: [path.resolve('./node_modules'), path.resolve('./src')],
    extensions: [
      '.js',
      '.jsx',
    ]
  },
  optimization: {
    minimizer: [
      // This is only used in production mode
      new OptimizeCSSAssetsPlugin({
        cssProcessor: require('cssnano'),
        cssProcessorPluginOptions: {
          preset: ['default', { discardComments: { removeAll: true } }],
        },
        canPrint: true
      }),
    ],
  },
  plugins: [
    isEnvProduction &&
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: 'dist/css/[name].css',
        chunkFilename: 'dist/css/[name].css',
      }),
  ],
  module: {
    rules: [
      {
        test: /\.(scss|sass)$/,
        exclude: /\.module\.(scss|sass)$/,
        use: getStyleLoaders(),
        // Don't consider CSS imports dead code even if the
        // containing package claims to have no side effects.
        // Remove this when webpack adds a warning or an error for this.
        // See https://github.com/webpack/webpack/issues/6571
        sideEffects: true,
      },
    ]
  }
}

// Bundle in commonjs format
const commonjsModule = {
  ...jsConfig,
  externals: [
    nodeExternals()
  ],
  output: {
    path: __dirname,
    filename: pkg.main,
    libraryTarget: 'commonjs2'
  },
};

// Bundle in browser compatible format
const browserModule = {
  ...jsConfig,
  output: {
    path: __dirname,
    filename: pkg.cdn,
    library: 'Channelize',
    libraryTarget: 'window'
  }
};

// Bundle all styles in css files
const cssModule = {
  ...cssConfig,
  output: {
    path: __dirname,
    filename: 'dist/[name].js',
    libraryTarget: 'commonjs2'
  }
};

module.exports = [commonjsModule, browserModule, cssModule];