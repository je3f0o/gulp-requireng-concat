(function () {

var __my_module__ = angular.module("test", []),
	__states__1480194136095 = [];

(function () {

	var TestController = [
		"$scope",
		function TestController ($scope) {

			console.log("Called : TestController");
		}
	];

	return __my_module__.controller("TestController", TestController);
}());

(function () {

	var ZController = [
		"$scope",
		function ZController ($scope) {

			console.log("Called : ZController");
		}
	];

	return __my_module__.controller("ZController", ZController);
}());

(function () {

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

	return __my_module__.directive("awe", AweDirective);
}());

(function () {

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

	__states__1480194136095.push(state);
}());

(function () {

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

	__states__1480194136095.push(state);
}());

(function () {

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

	__states__1480194136095.push(state);
}());

(function () {

	__my_module__.
		config(function ($locationProvider, $stateProvider, $urlRouterProvider) {
			$locationProvider.html5Mode({
				enabled     : true,
				requireBase : false
			});
			$urlRouterProvider.otherwise("/app/error/404/Not-Found");

			.$stateProvider.
				state("main.app", __states__1480194136095[0]).
				state("main.site", __states__1480194136095[1]).
				state("main.zzz", __states__1480194136095[2]);

		});
}());

}());