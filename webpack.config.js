var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
	entry: "./src/app.js",
	output: {
		path: __dirname + "/dist",
		filename: "build111.js"
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
		new ExtractTextPlugin("app.css")
	],
	devtool: "source-map"
}
