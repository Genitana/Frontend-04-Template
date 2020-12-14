module.exports = {
    // entry: "./src/main.js",
    entry: "./src/main.js",
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"],
                        plugins: [["@babel/plugin-transform-react-jsx",{pragma: "createElement"}]]
                    },
                },
                exclude: /node_modules/,
            }
        ]
    },
    mode: "development",
    devServer: {
        publicPath: "/dist",
    }
}