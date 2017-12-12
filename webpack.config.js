
let path = require('path');


let config = {
	module: {
		rules: [{
			test:    /\.js$/,
			exclude: /(node_modules)/,
			use: {
				loader:  'babel-loader',
				options: {
					presets: ['env']
				}
			}
		}]
	}
};


let lib = Object.assign({}, config, {
	entry: "./src/index.js",
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'flylsh.js'
	}
});

console.log(lib);

let app = Object.assign({}, config,{
	entry: "./evaluate/src/app.js",
	output: {
		path: path.resolve(__dirname, 'evaluate/assets'),
		filename: "app.js"
	}
});

//module.exports = lib;
module.exports = [lib, app];