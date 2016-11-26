/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : parser.js
* Created at  : 2016-11-26
* Updated at  : 2016-11-27
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
//ignore:start
"use strict";

/* global */
/* exported */
/* exported */

//ignore:end

let fse          = require("fs-extra"),
	path         = require("path"),
	jeefo_parser = require("jeefo-parser");

const	// Depricated legacy
		DEFINE_OPEN_REGEX  = /define[\s\t]*\([\s\t]*\[[^\]]*\][\s\t]*,[\s\t]*function[^\n]+/,
		DEFINE_CLOSE_REGEX = /\}[\s\t]*\)[\s\t;]*$/,

		STRICT_MODE_REGEX = /\"use strict\"\;\s*/ig;

// Depricated legacy
let clear = content => {
	return content.
		replace(STRICT_MODE_REGEX, '').
		replace(DEFINE_OPEN_REGEX, "(function () {").
		replace(DEFINE_CLOSE_REGEX, "}());");
};

// Parse source file
let parse_module = file => {
	let content = file.content.split('\n'), i, match;

	for (i = content.length - 1; i >= 0; --i) {
		match = content[i].match(/return\s+([^\s;]+)\s*;/);
		if (match) {
			content.splice(i, content.length);
			content[i] = `\treturn ${ file.placeholder.replace("VARIABLE", match[1]) };\n}());`;
			break;
		}
	}

	file.content = content.join('\n');
};

let parse_source_file = file => {
	file.content = clear(fse.readFileSync(file.path, "utf8"));
	jeefo_parser.parse(file);

	parse_module(file);

	file.is_parsed = true;
};

// Parse state file
let parse_state = file => {
	let content = file.content.split('\n'), i;

	for (i = content.length - 1; i >= 0; --i) {
		if (/return\s+state\s*;/.test(content[i])) {
			content.splice(i, content.length);
			content[i] = `\t${ file.placeholder };\n}());`;
			break;
		}
	}

	file.content = content.join('\n');
};

let parse_state_file = file => {
	file.content = clear(fse.readFileSync(file.path, "utf8"));
	jeefo_parser.parse(file);

	parse_state(file);

	file.is_parsed = true;
};

// Parse route manager
let parse_route_manager = builder => {
	let file = { path : path.join(builder.src_dir, "modules", "main_module.js") };

	if (! fse.existsSync(file.path) || (builder.router && builder.router.is_parsed)) {
		return;
	}
	if (builder.debug && builder.router && builder.router.is_parsed === false) {
		console.log("[Router file changed] :", file.path);
	}

	file.content = clear(fse.readFileSync(file.path, "utf8"));

	file.content = file.content.replace(/([\S\t]*)\$stateProvider\._STATES_\(\);/, ($0, $1) => {
		let indent = `${ $1 }\t`;

		let lines =  builder.state_files.map((file, index) => {
			return `${ indent }state("${ file.name }", ${ builder.states_variable }[${ index }])`;
		});

		return `${ $1 }.$stateProvider.\n${ lines.join(".\n") };\n`;
	}).trim();

	file.is_parsed = true;
	builder.router = file;
};

module.exports = {
	parse_state_file,
	parse_source_file,
	parse_route_manager,
};
