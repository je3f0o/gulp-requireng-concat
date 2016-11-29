/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : builder.js
* Created at  : 2016-11-26
* Updated at  : 2016-11-29
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

let fse       = require("fs-extra"),
	path      = require("path"),
	parser    = require("./parser"),
	pluralize = require("pluralize");

require("../utils");
//require("../event_dispatcher");

let get_old_file = (container, file) => {
	return container.until(f => f.path === file.path, f => f);
};

let error_messages = {
	exit : message => {
		console.error("ERROR : " + message);
		process.exit(1);
	}
};

let wrapper_template = `(function () { "use strict";

GLOBAL

SOURCE_CODES

}());`;

class AngularBuilder {
	constructor (parsed_options) {
		this.user_options              = parsed_options.options;
		this.current_working_directory = process.cwd();

		let module_dir      = this.user_options["module-directory"];
		this.requireng_path = module_dir ? path.resolve(module_dir) : this.current_working_directory;
		
		if (! fse.existsSync(this.requireng_path)) {
			console.error("requireng_path : " + this.requireng_path);
			error_messages.exit("Module directory is not found.");
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
	}

	init_config () {
		this.config = fse.readJsonSync(this.requireng_path);
		if (! this.config.name) { error_messages.exit("Module name is required!"); }

		let config       = this.config;
		let user_options = this.user_options;

		config.src_dir   = config.src_dir  || "src";
		config.dist_dir  = config.dist_dir || "dist";
		this.module_name = user_options.module || config.name;

		this.base_dir = path.dirname(this.requireng_path);
		this.src_dir  = path.resolve(this.base_dir, config.src_dir);

		let dist_dir  = user_options["output-directory"] || path.resolve(this.base_dir, config.dist_dir);
		this.output_file = path.resolve(dist_dir, this.module_name);
		if (! /.+(?:\.js)$/.test(this.module_name)) {
			this.output_file += ".js";
		}

		this.prepare_source_files();
		this.prepare_state_files();

		return this;
	}

	prepare_source_files () {
		let instance                = this,
			src_dir                 = instance.src_dir,
			source_file_types       = ["filters", "factories", "services", "controllers", "directives"],
			camel_case_source_files = ["filter", "directive"],
			old_source_files        = instance.source_files || [],
			source_files            = instance.source_files = [];

		source_file_types.forEach(type => {
			let files                = instance.config[type],
				file_type            = pluralize(type, 1),
				file_suffix          = `_${ file_type }.js`,
				is_camel_case_module = camel_case_source_files.exists(file_type);

			Object.keys(files).forEach(name => {
				let file = {
					type : file_type,
					path : path.join(src_dir, type, files[name] + file_suffix)
				},
				old_file = get_old_file(old_source_files, file);

				if (old_file) {
					source_files.push(old_file);
					return;
				}

				if (["factory", "service"].exists(file_type)) {
					name = `${ files[name] }_${ file_type }`;
				} else if (is_camel_case_module) {
					name = name.replace(/^([A-Z]+)/g, $1 => $1.toLowerCase());
				} else {
					name += file_type.capatalize();
				}

				file.placeholder = `__my_module__.${ file.type }("${ name }", VARIABLE)`;
				source_files.push(file);
			});
		});

		source_files.sort((a, b) => a.type.localeCompare(b.type));

		return instance;
	}

	prepare_state_files () {
		let instance        = this,
			old_states      = instance.state_files || [],
			state_files     = instance.state_files = [],
			states_dir      = path.join(instance.src_dir, "states"),
			states_variable = instance.states_variable = `__states__${ Date.now() }`;

		instance.config.states.forEach(name => {
			let file = {
				name        : name,
				path        : path.join(states_dir, `${ name }_state.js`),
				placeholder : `${ states_variable }.push(state)`,
			},
			old_file = get_old_file(old_states, file);

			if (old_file) {
				state_files.push(old_file);
				return;
			}

			state_files.push(file);
		});

		state_files.sort((a, b) => a.name.localeCompare(b.name));

		return instance;
	}

	parse_source_files () {
		this.source_files.forEach(file => {
			if (! file.is_parsed) {
				if (this.debug && file.is_parsed === false) {
					console.log("[Source file changed] :", file.path);
				}
				parser.parse_source_file(file);
			}
		});
	}

	parse_state_files () {
		this.state_files.forEach(file => {
			if (! file.is_parsed) {
				if (this.debug && file.is_parsed === false) {
					console.log("[State file changed] :", file.path);
				}
				parser.parse_state_file(file);
			}
		});
	}

	compile () {
		let states_variable      = this.states_variable,
			template             = this.source_files.map(f => f.content).join("\n\n"),
			state_files_template = this.state_files.map(f => f.content).join("\n\n"),
			global_template      = `var __my_module__ = angular.module("${ this.module_name }", [])`;

		if (state_files_template) {
			global_template += `,\n\t${ states_variable } = []`;

			template += `\n\n${ state_files_template }\n\n${ this.router.content }`;
		}

		template = wrapper_template.
			replace("GLOBAL", `${ global_template };`).
			replace("SOURCE_CODES", () => template);

		fse.outputFileSync(this.output_file, template);
	}

	build () {
		this.parse_source_files();
		this.parse_state_files();
		parser.parse_route_manager(this);
		this.compile();

		console.log(`[${ this.module_name }] - Build succeeded!`);
	}
}

module.exports = AngularBuilder;
