/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name  : watcher.js
* Purpose    :
* Created at : 2015-10-09
* Updated at : 2015-10-09
* Author     : jeefo
_._._._._._._._._._._._._._._._._._._._._.*/

"use strict";

var fse      = require("fs-extra"),
	path     = require("path"),
	parser   = require("./parser"),
	chokidar = require("chokidar");

var chokidar_options = {
	persistent     : true,
	ignoreInitial  : false,
	followSymlinks : true,

	depth            : 99,
	interval         : 100,
	alwaysStat       : false,
	usePolling       : true,
	binaryInterval   : 300,
	awaitWriteFinish : {
		pollInterval       : 100,
		stabilityThreshold : 2000
	},

	ignorePermissionErrors : false,
	atomic                 : true
};

function watch_modules (builder, options) {
	var watch_glob = path.join(builder.src_dir, "**", "*.js");

	options.cwd = builder.src_dir;
	fse.ensureDirSync(options.cwd);

	chokidar.watch(watch_glob, options).on("change", function (filepath) {
		var container = /^states\/.+$/.test(filepath) ? builder.states : builder.modules,
			module, i, len;

		for (i = 0, len = container.length; i < len; ++i) {
			if (container[i].relative_path === filepath) {
				module = container[i];
				module.is_parsed = false;
				break;
			}
		}

		if (module) {
			console.log("changed:", filepath);
			parser.parse_module(builder, module);
		}
	});
}

function watch_config (builder, options) {
	chokidar.watch(builder.requireng_path, options).on("change", function () {
		builder.init_config().build();
	});
}

module.exports = function (builder) {
	watch_config(builder, chokidar_options);
	watch_modules(builder, chokidar_options);
};
