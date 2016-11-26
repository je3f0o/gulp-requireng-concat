
"use strict";

define([], function () {

	var state = {
		url : "",
		abstract : false,
		templateUrl : "/templates/states/main.app_state.html",
		controller : [
			"$scope", "data",
			function AppState ($scope, data) {

				console.log("Called : AppState changed");
			}
		],
		resolve : {
			data : [
				function () {

					return "AppState";
				}
			]
		}
	};

	return state;
});
