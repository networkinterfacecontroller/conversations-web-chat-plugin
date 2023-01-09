const path = require('path');

const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
    mode: isDevelopment ? 'development' : 'production',
    devServer: {
      hot: true,
      static: {
        directory: path.join(__dirname, 'public'),
      },
      compress: true,
      port: 9000,
    },
    entry: './src/index.tsx',
    resolve: { 
        extensions: ['.tsx', '.ts', '...']
    },
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'main.bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.m?[jt]sx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        plugins: [isDevelopment && require.resolve('react-refresh/babel')].filter(Boolean)
                    }
                }
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    'resolve-url-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            implementation: require("sass"),
                        }
                    }
                ]
            },
            {
                test: /\.(woff(2)?|ttf|otf|svg|eot)$/i,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'fonts/'
                    }
                }
            }
        ]
    },
    "plugins": [isDevelopment && new ReactRefreshWebpackPlugin()].filter(Boolean)
}