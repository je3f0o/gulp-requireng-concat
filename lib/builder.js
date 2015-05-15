/* jshint quotmark : false */
/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name  : builder.js
* Purpose    :
* Created at : 2015-05-15
* Updated at : 2015-05-15
* Author     : jeefo
_._._._._._._._._._._._._._._._._._._._._.*/

"use strict";

var fs        = require("fs"),
	path      = require("path"),
	pluralize = require("pluralize"),

	options = { encoding : "utf8" };

if (String.prototype.capatalize === void 0) {
	String.prototype.capatalize = function () {
		return this.charAt(0).toUpperCase() + this.slice(1);
	};
}

function strip_define (file) {
	for (var i = 0, len = file.length; i < len; ++i) {
		if (file[i].indexOf("define([") === 0) {
			file[i] = "\n(function () {";
			file.splice(0, i);
			return;
		}
	}
}

function wrap_quotmark (str) {
	return '"' + str + '"';
}

var Builder = function (requireng_path) {
	this.file             = ""; // empty string buffer for cache

	this.requireng_json   = require(requireng_path);
	this.application_name = this.requireng_json.application_name;

	this.base_dir         = path.dirname(requireng_path);
	this.src_dir          = path.join(this.base_dir, this.requireng_json.src_dir);
	this.dest_dir         = path.join(this.base_dir, this.requireng_json.dest_dir);

	this.output_file      = path.join(this.dest_dir, this.application_name + ".js");

	var deps = this.requireng_json.dependencies.map(wrap_quotmark);
	this.dependencies = "[" + deps.join(", ") + "]";

	return this;
},
p = Builder.prototype;

p.prepare_dependency = function (dependency) {
	this.dependency_dir = path.join(this.src_dir, dependency);

	this.module      = pluralize(dependency, 1);
	this.suffix      = this.module.capatalize();
	this.file_suffix = "_" + this.module + ".js";
};

p.get_filename = function (module_name) {
	var filename = module_name + this.file_suffix;
	return path.join(this.dependency_dir, filename);
};

p.open_function = function () {
	this.file += "(function () {\n";
	return this;
};

p.close_function = function () {
	this.file += "\n}());\n\n";
	return this;
};

p.open = function () {
	var args = '"' + this.application_name + '", ' + this.dependencies;

	this.open_function();

	this.file += '\t"use strict";\n\n';
	this.file += "\tvar " + this.application_name + " = angular.module(" + args + ");\n";

	return this;
};

p.close = function () {
	this.close_function();
	return this;
};

p.make_module = function (module, filepath, module_name) {
	var file = fs.readFileSync(filepath, options).split("\n"),
		module_placeholder = '\tAPP.METHOD("MODULE_NAME", MODULE);',
		i, content;
	
	strip_define(file);

	for (i = file.length - 1; i >= 0; --i) {
		if (file[i].indexOf("return " + module + ";") >= 0) {
			file.splice(i);
			break;
		}
	}

	module_name = module_name || module;

	content = module_placeholder
		.replace("APP", this.application_name)
		.replace("METHOD", this.module)
		.replace("MODULE_NAME", module_name)
		.replace("MODULE", module);
	
	file.push(content);

	this.file += file.join("\n");
	this.close_function();
};

p.build_states = function (states) {
	var states_dir = path.join(this.src_dir, "states"),
		filepath, file, match, i, len;

	this.file += "\tvar $_states = [];\n";

	states.forEach(function (state) {
		filepath = path.join(states_dir, state + "_state.js");

		file = fs.readFileSync(filepath, options).split("\n");
		strip_define(file);

		for (i = file.length - 1; i >= 0; --i) {
			if (file[i].indexOf("return state;") >= 0) {
				file.splice(i);
				file[i] = "\t$_states.push(state);";
				break;
			}
		}

		this.file += file.join("\n");
		this.close_function();

	}.bind(this));

	filepath = path.join(this.src_dir, this.requireng_json.router_manager + ".js")
	file = fs.readFileSync(filepath, options).split("\n");

	for (i = 0, len = file.length; i < len; ++i) {
		match = /^[\s\t]*\.config\(function[\s\t]*\(([^\)]*)\)/.exec(file[i + 2]);
		if (match) {
			file[i] = "\t" + this.application_name + ".config([";
			file[i + 1] = "\t\t" + match[1].split(", ").map(wrap_quotmark).join(", ") + ",";
			file[i + 2] = "\t\tfunction (" + match[1] + ") {";

			file.splice(0, i);
			break;
		}
	}

	for (i = file.length - 1; i >= 0; --i) {
		if (file[i].indexOf("$stateProvider") >= 0) {
			file[i] = "\t\t\t$stateProvider";
			file.splice(i + 1);
			break;
		}
	}

	for (i = 0, len = states.length; i < len; ++i) {
		file.push('\t\t\t\t.state("' + states[i] + '", $_states[' + i + '])');
	}

	this.file += file.join("\n") + ";\n";
	this.file += "\t\t}\n";
	this.file += "\t]);\n";

	return this;
};

p.build_route_manager = function () {
	var states = this.requireng_json.states;

	if (states.length > 0) {
		this.open_function().build_states(states).close_function();
	}
};

p.build = function () {
	var dependencies = ["filters", "factories", "services", "controllers", "directives"];

	this.open();

	dependencies.forEach(function (dependency) {
		var modules = this.requireng_json[dependency];

		this.prepare_dependency(dependency);

		Object.keys(modules).forEach(function (name) {
			var filename = this.get_filename(modules[name]),
				module   = name + this.suffix,
				module_name;

			if (["factory", "service"].indexOf(this.module) >= 0) {
				module_name = modules[name] + "_" + this.module;
			} else if (this.module === "directive") {
				module_name = name.replace(/^([A-Z]+)/g, function ($1) { return $1.toLowerCase(); });
			}

			this.make_module(module, filename, module_name);
		}.bind(this));

	}.bind(this));

	this.build_route_manager();

	this.close();

	fs.writeFileSync(this.output_file, this.file, options);

	return {
		src  : this.output_file,
		dest : this.dest_dir
	};
};

module.exports = Builder;
