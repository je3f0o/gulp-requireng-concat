/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : watcher.js
* Purpose    :
* Created at : 2015-10-09
* Updated at : 2015-10-09
* Author     : jeefo
_._._._._._._._._._._._._._._._._._._._._.*/

"use strict";

let chokidar = require("chokidar");

require("jeefo");

let chokidar_options = {
	usePolling       : true,
	/*
	awaitWriteFinish : {
		pollInterval       : 100,
		stabilityThreshold : 2000
	},
	*/
};

let get_files = builder => {
	let files = builder.source_files.map(f => f.path);
	files = files.concat(builder.state_files.map(f => f.path));

	if (builder.router) {
		files.push(builder.router.path);
	}

	return files;
};

let add_files = (builder, watcher) => {
	watcher.files = get_files(builder);
	watcher.add(watcher.files);
};

module.exports = builder => {
	let watcher = chokidar.watch(builder.requireng_path, chokidar_options).unwatch(builder.requireng_path);

	watcher.on("change", filepath => {
		console.log(`Changed : ${ filepath }`);

		let is_found = builder.source_files.some(f => {
			if (f.path === filepath) {
				f.is_parsed = false;
				return true;
			}
		});

		if (! is_found) {
			if (builder.router && builder.router.path === filepath) {
				builder.router.is_parsed = false;
				is_found = true;
			}
		}

		if (! is_found) {
			builder.state_files.some(f => {
				if (f.path === filepath) {
					f.is_parsed = false;
					return true;
				}
			});
		}

		builder.build();
	});

	watcher.on("ready", function () {
		add_files(builder, watcher);

		chokidar.watch(builder.requireng_path, chokidar_options).on("change", () => {
			console.log("requireng.json changed.");
			watcher.unwatch(watcher.files);

			setTimeout(() => {
				//console.log("Unwatched :", watcher.getWatched());

				// Reconfigure
				builder.init_config().build();

				add_files(builder, watcher);

				//setTimeout(() => { console.log("Watched :", watcher.getWatched()); });
			});
		});
	});
};
