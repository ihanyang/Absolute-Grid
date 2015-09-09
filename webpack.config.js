var ExtractTextPlugin = require("extract-text-webpack-plugin")
var webpack = require("webpack")

module.exports = {
	entry: ["./src/app.js"],
	output: {
		path: __dirname + "/dist",
		filename: "build.js"
	},
	module: {
		loaders: [
			{
				test: /\.vue$/,
				loader: "vue"
			},
			{
				test: /\.css$/,
				loader: ExtractTextPlugin.extract("style-loader", "css-loader")
			},
			{
				test: /\.(png|jpg)$/,
				loader: "url-loader?limit=8192"
			},
			{
				test: /\.json$/,
				loader: "json"
			}
		]
	},
	plugins: [
		new ExtractTextPlugin("app.css"),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			}
		})
	],
	devtool: false
}
