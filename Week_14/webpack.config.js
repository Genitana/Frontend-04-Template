const { module } = require("../Week_13/jsx/webpack.config");
module.exports = {
    entry: './src/gesture.js',
    mode: "development",
    devServer: {
        publicPath: "/dist",
    }
}