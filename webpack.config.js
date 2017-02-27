const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: {
      vendors: ['react', 'react-dom', 'react-router'],
      app: "./src/main.js",
      platform: "./src/platform.js"
    },
    // externals: {
    //     "react": "React",
    //     "react-dom": "ReactDOM"
    // },
    resolve: {
      root: path.resolve(__dirname),
      alias: {
        'src': 'src'
      },
      extensions: ['', '.js', '.jsx']
    },
    output: {
        path: "./server/public/build/",
        // path: "/",
        // publicPath: "/build/",
        filename: "[name].bundle.js"
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel"
            },
            {
                test: /\.less$/,
                loader: "style!css!less"
            },
            {
                test: /\.css$/,
                loader: "style!css"
            },
            {
                test: /\.(png|jpg)$/,
                loader: "url-loader?limit=8192"
            }
        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
          name: 'vendors',
          filename: 'vendors.js'
        }),

        new webpack.DefinePlugin({
          'process.env': {
            'NODE_ENV': JSON.stringify('production')
          }
        }),

        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ]
};
