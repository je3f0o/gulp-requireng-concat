/* jshint quotmark : false */
/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name  : parser.js
* Purpose    :
* Created at : 2015-10-02
* Updated at : 2015-10-09
* Author     : jeefo
_._._._._._._._._._._._._._._._._._._._._.*/

"use strict";

var fse       = require("fs-extra"),
	path      = require("path"),
	events    = require("jeefo-event-dispatcher"),
	sprintf   = require("util").format,
	templates = require("./templates");

require("./utils");

function trim (str)          { return str.trim();              }
function wrap (str, wrapper) { return wrapper + str + wrapper; }
function wrap_quotmark (str) { return wrap(str, '"');          }

function get_file_content (filepath) {
	var content = fse.readFileSync(filepath, "utf8").split("\n");
	
	for (var i = 0, len = content.length; i < len; ++i) {
		content[i] = content[i].replace(/^\t/, "");
	}

	return content;
}

function replace_define_wrapper (module) {
	var content = module.content, i = 0, len = content.length;

	for (; i < len; ++i) {
		if (templates.REGEX_DEFINE.test(content[i])) {
			content[i] = templates.OPEN_SELF_EXECUTE_FUNCTION;
			content.splice(0, i);
			break;
		}
	}

	for (i = content.length - 1; i >= 0; --i) {
		if (content[i].indexOf("return " + module.variable + ";") >= 0) {
			content.splice(i);
			content[i] = module.placeholder;
			break;
		}
	}

	content.push(templates.CLOSE_SELF_EXECUTE_FUNCTION);
	module.is_parsed = true;
}

function parse_module (builder, module) {
	var absolute_path = path.join(builder.src_dir, module.relative_path)

	module.content = get_file_content(absolute_path);

	replace_define_wrapper(module);
	events.emit("parsed", builder);
}

function parse_route_manager (builder, indent) {
	var states = builder.states,
		filepath, content, match, args, i, len;

	filepath = path.resolve(builder.src_dir, builder.config.router_manager + ".js")
	content = get_file_content(filepath);

	for (i = 0, len = content.length; i < len; ++i) {
		match = /^[\s\t]*\.config\(function[\s\t]*\(([^\)]*)\)/.exec(content[i + 2]);
		if (match) {
			content[i    ] = sprintf("%s%s.config([", indent.current, builder.module_name);
			args = match[1].split(",").map(trim);
			content[i + 1] = "\t" + args.map(wrap_quotmark).join(", ") + ",";
			content[i + 2] = "\tfunction (" + args.join(", ") + ") {";

			content.splice(0, i);
			break;
		}
	}

	for (i = content.length - 1; i >= 0; --i) {
		if (content[i].indexOf("$stateProvider") >= 0) {
			content[i] = "\t\t$stateProvider";
			content.splice(i + 1);
			break;
		}
	}

	for (i = 0, len = states.length; i < len; ++i) {
		var line = sprintf('\t\t\t.state("%s", %s[%d])', states[i].name, builder.states_variable, i);
		if (i + 1 === len) { line += ";"; }
		content.push(line);
	}

	content.push("\t}");
	content.push("]);\n");
	return wrap(content.join("\n" + indent.current), "\n");
}

module.exports = {
	wrap                : wrap,
	wrap_quotmark       : wrap_quotmark,
	parse_module        : parse_module,
	parse_route_manager : parse_route_manager
};
