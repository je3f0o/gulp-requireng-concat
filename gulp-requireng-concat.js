/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name  : gulp-requireng-concat.js
* Purpose    :
* Created at : 2015-05-15
* Updated at : 2015-05-15
* Author     : jeefo
_._._._._._._._._._._._._._._._._._._._._.*/

"use strict";

var gutil     = require("gulp-util"),
	Builder   = require("./lib/builder"),

	PluginError = gutil.PluginError;

module.exports = function(requireng_path) {
	if (! requireng_path) {
		throw new PluginError("gulp-requireng-concat", "Missing requireng.json file's path for gulp-requireng-concat");
	}

	var builder = new Builder(requireng_path);
	
	return builder.build();
};
