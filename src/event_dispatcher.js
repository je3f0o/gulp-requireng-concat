/* jshint quotmark : false */
/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name  : event_dispatcher.js
* Purpose    :
* Created at : 2015-10-06
* Updated at : 2015-10-09
* Author     : jeefo
_._._._._._._._._._._._._._._._._._._._._.*/

"use strict";

var fse       = require("fs-extra"),
	events    = require("jeefo-event-dispatcher"),
	parser    = require("./parser"),
	sprintf   = require("util").format,
	templates = require("./templates");

function open_self_execute_function (indent) {
	var line = indent.current + "(function () {";
	indent.level.push(indent.type);
	indent.current = indent.level.join("");
	return line;
}

function close_self_execute_function (indent) {
	indent.level.pop();
	indent.current = indent.level.join("");
	var line = indent.current + "}());";

	if (indent.level.length) {
		line += "\n";
	}

	return line;
}

function parse_line (line, indent) {
	switch (line) {
		case templates.OPEN_SELF_EXECUTE_FUNCTION :
			line = open_self_execute_function(indent);
			break;
		case templates.CLOSE_SELF_EXECUTE_FUNCTION :
			line = close_self_execute_function(indent);
			break;
		default:
			line = indent.current + line;
	}

	return line;
}

function build_modules (modules, indent) {
	return modules.map(function (module) {
		return module.content.map(function (line) {
			return parse_line(line, indent);
		}).join("\n");
	}).join("\n");
}

function build_route_manager (builder, indent) {
	if (! builder.states.length) { return ""; }

	var buffer = open_self_execute_function(indent) + "\n\n";

	buffer += sprintf("%svar %s = [];\n\n", indent.current, builder.states_variable);

	buffer += build_modules(builder.states, indent);
	buffer += parser.parse_route_manager(builder, indent);

	buffer += close_self_execute_function(indent);
	return buffer + "\n";
}

events.on("ready", function (builder) {
	var indent = {
		type    : "\t",
		level   : [],
		current : ""
	};
	
	var buffer = open_self_execute_function(indent) + ' "use strict";\n\n';
	var args = sprintf('"%s", %s', builder.module_name, builder.dependencies);
	buffer += sprintf("%svar %s = angular.module(%s);\n", indent.current, builder.module_name, args);

	buffer += parser.wrap(build_modules(builder.modules, indent), "\n");
	buffer += build_route_manager(builder, indent);

	buffer += close_self_execute_function(indent);

	fse.outputFileSync(builder.output_file, buffer);
	console.log(builder.module_name + " - Build succeeded!");
});

events.on("parsed", function (builder) {
	var i, len, is_ready = true;

	for (i = 0, len = builder.modules.length; is_ready && i < len; ++i) {
		is_ready = builder.modules[i].is_parsed;
	}

	for (i = 0, len = builder.states.length; is_ready && i < len; ++i) {
		is_ready = builder.states[i].is_parsed;
	}

	if (is_ready) { this.emit("ready", builder); }
});

