const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const VueLoaderPlugin = require("vue-loader/lib/plugin");

module.exports = [
    {
        entry : ['@babel/polyfill', './test/index.js'],
        output: {
            path    : __dirname + '/dist',
            filename: "test.js"
        },
        mode  : 'development',
        target: 'node',
        node  : {
            __dirname : false,
            __filename: false
        },
        module: {
            rules: [
                {
                    test   : /\.js$/,
                    exclude: /node_modules/,
                    use    : {
                        loader : "babel-loader?cacheDirectory",
                        options: {
                            presets: ['@babel/preset-env'],
                            plugins: ['@babel/plugin-proposal-throw-expressions', 'babel-plugin-root-import'],
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
                    test  : /\.(png|woff|woff2|eot|ttf|svg)$/,
                    loader: 'url-loader?limit=100000'
                },
                {
                    test: path.resolve(__dirname, 'node_modules/electron-chromedriver/chromedriver.js'),
                    use : 'shebang-loader',
                },
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
            new webpack.SourceMapDevToolPlugin({
                                                   filename: "[file].map"
                                               }),
            new webpack.NamedModulesPlugin(),
            new webpack.HotModuleReplacementPlugin(),
            new webpack.EnvironmentPlugin(['NODE_ENV']),
            new webpack.DefinePlugin(
                {
                    $inject: (name) => process.env.NODE_ENV.match(/test/) ?
                                       require('../test/mocks/' + name + '.mock') : require(name)
                })
        ]
    }
];