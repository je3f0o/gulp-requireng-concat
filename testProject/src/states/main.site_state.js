
"use strict";

define([], function () {

	var state = {
		url : "",
		abstract : false,
		templateUrl : "/templates/states/main.site_state.html",
		controller : [
			"$scope", "data",
			function SiteState ($scope, data) {

				console.log("Called : SiteState");
			}
		],
		resolve : {
			data : [
				function () {

					return "SiteState";
				}
			]
		}
	};

	return state;
});
