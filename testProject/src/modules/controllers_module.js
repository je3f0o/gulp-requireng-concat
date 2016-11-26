
"use strict";

define([
	"controllers/test_controller",
	"controllers/z_controller"
], function () {

	var module_name = "myControllers";

	angular.module(module_name, [])
		.controller("test_controller", arguments[0])
		.controller("z_controller", arguments[1]);
	
	return module_name;
});
