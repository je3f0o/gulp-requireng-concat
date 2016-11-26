
"use strict";

define([], function () {

	var state = {
		url : "",
		abstract : false,
		templateUrl : "/templates/states/main.zzz_state.html",
		controller : [
			"$scope", "data",
			function ZzzState ($scope, data) {

				console.log("Called : ZzzState");
			}
		],
		resolve : {
			data : [
				function () {

					return "ZzzState";
				}
			]
		}
	};

	return state;
});
