const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const VueLoaderPlugin = require("vue-loader/lib/plugin");

module.exports = [
    {

        mode  : 'development',
        entry : ['babel-polyfill', './src/electron.js'],
        target: 'electron-main',
        module: {
            rules: [{
                test   : /\.js$/,
                exclude: /node_modules/,
                use    : {
                    loader : "babel-loader",
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: ['@babel/plugin-proposal-throw-expressions']
                    }
                },

            }, {
                test: /\.(png|jpg|gif)$/,
                use : "url-loader"
            }]
        },
        output: {
            path    : __dirname + '/dist',
            filename: 'electron.js'
        }
    },
    {
        target: "electron-renderer",
        entry : ['babel-polyfill', './src/main.js'],
        output: {
            path    : __dirname + '/dist',
            filename: "bundle.js"
        },
        module: {
            rules: [
                {
                    test   : /\.js$/,
                    exclude: /node_modules/,
                    use    : {
                        loader : "babel-loader",
                        options: {
                            presets: ['@babel/preset-env'],
                            plugins: ['@babel/plugin-proposal-throw-expressions']
                        }
                    },
                },
                {
                    test: /\.vue$/,
                    use : "vue-loader"
                },
                {
                    test   : /\.s?css$/,
                    use    : ["vue-style-loader", "style-loader", "css-loader", "sass-loader"],
                    include: [
                        path.join(__dirname, 'src'),
                        /node_modules/
                    ],
                },
                {
                    test: /\.svg$/,
                    use : "file-loader"
                }
            ]
        },

        resolve: {
            extensions: [".vue", ".js", ".scss"],
            alias     : {
                "@": './src'
            }
        },

        plugins: [
            new VueLoaderPlugin(),

            new webpack.NamedModulesPlugin(),

            new HtmlWebpackPlugin({
                                      template: './src/index.html',
                                      inject  : false
                                  })
        ]
    }
];