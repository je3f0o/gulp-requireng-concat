/* jshint quotmark : false */
/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name  : builder.js
* Purpose    :
* Created at : 2015-05-15
* Updated at : 2015-10-14
* Author     : jeefo
_._._._._._._._._._._._._._._._._._._._._.*/

"use strict";

var fse            = require("fs-extra"),
	path           = require("path"),
	parser         = require("./parser"),
	sprintf        = require("util").format,
	pluralize      = require("pluralize"),
	error_messages = require("./error_messages").Create();

require("./event_dispatcher");

function is_added (container, module) {
	var i, len;

	for (i = 0, len = container.length; i < len; ++i) {
		if (container[i].relative_path === module.relative_path) {
			return true;
		}
	}
}

var Builder = function (parsed_options) {
	this.user_options              = parsed_options.options;
	this.current_working_directory = process.cwd();
	this.requireng_path = this.user_options["module-directory"] || this.current_working_directory;
	this.requireng_path = path.resolve(this.requireng_path);
	
	if (! fse.existsSync(this.requireng_path)) {
		console.error("requireng_path : " + this.requireng_path);
		error_messages.exit("Source directory is not found.");
	}
	if (fse.lstatSync(this.requireng_path).isDirectory()) {
		this.requireng_path = path.join(this.requireng_path, "requireng.json");
	}
	if (! fse.existsSync(this.requireng_path)) {
		console.error("requireng_path : " + this.requireng_path);
		error_messages.exit("'requireng.json' file is not found.");
	}

	this.init_config();

	return this;
},
p = Builder.prototype;

p.init_config = function () {
	this.config  = fse.readJsonSync(this.requireng_path);
	if (! this.config.name) { error_messages.exit("Module name is required!"); }

	var cwd          = this.current_working_directory;
	var config       = this.config;
	var user_options = this.user_options;

	config.src_dir   = config.src_dir  || path.resolve(cwd, "src");
	config.dist_dir  = config.dist_dir || path.resolve(cwd, "dist");
	this.module_name = user_options.module || config.name;

	this.base_dir = path.dirname(this.requireng_path);
	this.src_dir  = path.resolve(this.base_dir, config.src_dir);
	this.dist_dir = user_options["output-directory"] || path.resolve(this.base_dir, config.dist_dir);

	this.output_file = path.resolve(this.dist_dir, this.module_name);
	if (! /.+(?:\.js)$/.test(this.module_name)) {
		this.output_file += ".js";
	}

	this.dependencies = config.dependencies.map(parser.wrap_quotmark);
	this.dependencies = "[" + this.dependencies.join(", ") + "]";

	return this;
};

p.prepare_modules = function () {
	var module_types       = ["filters", "factories", "services", "controllers", "directives"],
		camel_case_modules = ["filter", "directive"];

	this.modules = this.modules || [];

	module_types.forEach(function (type) {
		var modules             = this.config[type];
		var module_type         = pluralize(type, 1);
		var suffix              = module_type.capatalize();
		var file_suffix         = "_" + module_type + ".js";
		var is_camelcase_module = camel_case_modules.indexOf(module_type) >= 0;

		Object.keys(modules).forEach(function (name) {
			var module = {
				type          : module_type,
				variable      : name + suffix,
				relative_path : path.join(type, modules[name] + file_suffix)
			};
			if (is_added(this.modules, module)) { return; }

			if (["factory", "service"].indexOf(module_type) >= 0) {
				module.name = modules[name] + "_" + module_type;
			} else if (is_camelcase_module) {
				module.name = name.replace(/^([A-Z]+)/g, function ($1) { return $1.toLowerCase(); });
			} else {
				module.name = module.variable;
			}

			module.placeholder = sprintf('%s.%s("%s", %s);', this.module_name, module.type, module.name, module.variable);
			this.modules.push(module);
		}, this);
	}, this);

	this.modules.sort(function (a, b) {
		return a.type.localeCompare(b.type);
	});

	return this;
};

p.prepare_states = function () {
	var states  = this.config.states || [];

	this.states          = this.states || [];
	this.states_variable = this.states_variable || "__states" + Date.now();

	states.forEach(function (name) {
		var state = {
			name          : name,
			variable      : "state",
			placeholder   : sprintf("%s.push(state);", this.states_variable),
			relative_path : path.join("states", name + "_state.js")
		};
		if (is_added(this.states, state)) { return; }

		this.states.push(state);
	}, this);

	this.states.sort(function (a, b) {
		return a.name.localeCompare(b.name);
	});

	return this;
};

p.build = function () {
	this.prepare_modules().prepare_states();

	this.modules.forEach(function (module) {
		if (! module.is_parsed) {
			parser.parse_module(this, module);
		}
	}, this);

	this.states.forEach(function (state) {
		if (! state.is_parsed) {
			parser.parse_module(this, state);
		}
	}, this);
};

module.exports = Builder;
