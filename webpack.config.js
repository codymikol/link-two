const path = require('path');
var nodeExternals = require('webpack-node-externals');

module.exports = {
    mode: 'development',
    node: false,
    target: 'node',
    externals: [nodeExternals()],
    entry: './server/index.js',
    output: {
        filename: 'server.js',
        path: path.resolve(__dirname, './')
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components|public|client)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
};