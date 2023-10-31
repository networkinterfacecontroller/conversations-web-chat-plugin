const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');
const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = () =>{ 
 
    const env = dotenv.config().parsed;
  
    const envKeys = Object.keys(env).reduce((prev, next) => {
        prev[`process.env.${next}`] = JSON.stringify(env[next]);
        return prev;
    }, {});


    return {
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
        plugins: [
            new webpack.DefinePlugin(envKeys),
        ],
        module: {
            rules: [
                {
                    test: /\.m?[jt]sx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
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
                                sourceMap: true
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
        }
    }
}