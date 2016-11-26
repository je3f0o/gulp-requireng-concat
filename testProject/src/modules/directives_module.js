
"use strict";

define([
	"directives/awe_directive"
], function () {

	var module_name = "myDirectives";

	angular.module(module_name, [])
		.directive("awe", arguments[0]);
	
	return module_name;
});
