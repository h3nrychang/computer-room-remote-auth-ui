const webpack = require('webpack');
const packageJson = require('./package.json');

module.exports = {
    // 其他webpack配置
    plugins: [
        new webpack.DefinePlugin({
            'process.env.VERSION': JSON.stringify(packageJson.version),
        }),
    ],
};
