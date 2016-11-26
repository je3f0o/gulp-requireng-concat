
"use strict";

define([], function () {

	__my_module__.
		config(function ($locationProvider, $stateProvider, $urlRouterProvider) {
			$locationProvider.html5Mode({
				enabled     : true,
				requireBase : false
			});
			$urlRouterProvider.otherwise("/app/error/404/Not-Found");

			$stateProvider._STATES_();
		});
});
