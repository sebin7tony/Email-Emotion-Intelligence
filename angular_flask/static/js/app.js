'use strict';

var kazeon = angular.module('kazApp',['ngRoute','kazeon.services','kazeon.controller','kazeon.directive','ui.bootstrap','nvd3']);


kazeon.config(['$routeProvider',function($routeProvider){
	
	$routeProvider.
		when("/users",{
			templateUrl : "/static/partials/top-users-view.html",
			controller : "mainCtrl"
		}).
		when("/user_detail",{
			templateUrl : "/static/partials/user-details-emotion.html",
			controller : "mainCtrl"
		}).
		when("/user_emotion_analysis",{
			templateUrl : "/static/partials/user-emotion-analysis.html",
			controller : "mainCtrl"
		}).
		otherwise({redirectTo : "/users"});
		
}]);