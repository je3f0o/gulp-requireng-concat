
"use strict";

define([], function () {

	var AweDirective = [
		function AweDirective () {
			console.log("Called : AweDirective");

			return {
				restrict : "EA",
				scope : {
					data : "=data"
				},
				templateUrl : "/templates/directives/awe_directive.html",
				transclude : false,
				replace : true,
				link : function (scope, element, attrs) {
					
				},
				controller : [
					"$scope",
					function ($scope) {

						console.log("AweDirective is fired!");
					}
				]
			};
		}
	];

	return AweDirective;
});
