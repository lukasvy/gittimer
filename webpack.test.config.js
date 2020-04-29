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
                "@"                 : path.resolve(__dirname, 'src'),
                "electron"          : path.resolve(__dirname, "test/mocks/electron.mock.js"),
                "electron-store"    : path.resolve(__dirname, "test/mocks/electron-store.mock.js"),
                "fs"                : path.resolve(__dirname, "test/mocks/fs.mock.js"),
                "path"              : path.resolve(__dirname, "test/mocks/path.mock.js"),
                "simple-git/promise": path.resolve(__dirname, "test/mocks/simple-git.promise.mock.js"),
            }
        },
        plugins: [
            new VueLoaderPlugin(),
            new webpack.SourceMapDevToolPlugin({
                                                   filename: "[file].map"
                                               }),
            new webpack.NamedModulesPlugin(),
            new webpack.HotModuleReplacementPlugin(),
            new webpack.EnvironmentPlugin(['NODE_ENV'])
        ]
    }
];