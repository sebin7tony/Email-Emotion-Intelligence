'use strict';

var kazServices = angular.module("kazeon.services",[]);

kazServices.factory("sharedData",['$http',function($http){

	var data = {};

    data.setData = function(newdata){

        data.current_detail_user = newdata; 
    }

    data.getData = function(){

        return data.current_detail_user;
    }

    data.setEmailWiseAnalyticsData = function(newdata){

        data.emailWiseAnalyticsData = newdata;
    }

    data.getEmailWiseAnalyticsData = function(){

        return data.emailWiseAnalyticsData;
    }

	return data;
}]);

kazServices.factory("emotionServices",['$http','$location',function($http,$location){

	var data = {};

	//var hostname = $location.host()+":"+$location.port();
	var hostname = 'localhost:5000';


    data.getTopEmailAnalytics = function(){

		var url = "http://"+hostname+"/emetrics/api/v1.0/top_users";

		return $http.get(url)
            .then(
                function(response){
                    //console.log("success-"+response.data);
                    return response.data;
                }, 
                function(errResponse){
                    console.error('Error in fetching getTopEmailAnalytics');
                    return undefined;
                }
            );
    }; //end of getTopEmailAnalytics function

    data.getFilteredUserAnalytics = function(user_email,email_count,last_n_filter){

        var url = "http://"+hostname+"/emetrics/api/v1.0/user_last_n";

        var data = JSON.parse('{"user_email": "'+user_email+'","email_count": '+email_count+',"last_n_filter" : '+last_n_filter+' }');

        var config = {
                headers : {
                    'Content-Type': 'application/json'
                }
        }

        return $http.post(url, data, config)
            .success(function (data, status, headers, config) {

                //console.log("inside getFilteredUserAnalytics success : "+JSON.stringify(data,null,4));
                return data;
            })
            .error(function (data, status, header, config) {

                console.error('Error in executing the getSearchResultsBoost');
                console.log(data);
                return undefined;
            });

    }; //end of getSearchResultsBoost function


    data.getFrequentRecipients = function(user_email){

        var url = "http://"+hostname+"/emetrics/api/v1.0/recipient_freq";

        var data = JSON.parse('{"user_email": "'+user_email+'"}');

        var config = {
                headers : {
                    'Content-Type': 'application/json'
                }
        }

        return $http.post(url, data, config)
            .success(function (data, status, headers, config) {

                //console.log("inside getFrequentRecipients success : "+JSON.stringify(data,null,4));
                return data;
            })
            .error(function (data, status, header, config) {

                console.error('Error in executing the getFrequentRecipients');
                console.log(data);
                return undefined;
            });

    }; //end of getFrequentRecipients function


    data.getemailwiseAnalyticsData = function(user_email){

        var url = "http://"+hostname+"/emetrics/api/v1.0/emailwise_emotion_analytics";

        var data = JSON.parse('{"user_email": "'+user_email+'"}');

        var config = {
                headers : {
                    'Content-Type': 'application/json'
                }
        }

        return $http.post(url, data, config)
            .success(function (data, status, headers, config) {

                //console.log("inside getemailwiseAnalyticsData success : "+JSON.stringify(data,null,4));
                return data;
            })
            .error(function (data, status, header, config) {

                console.error('Error in executing the getemailwiseAnalyticsData');
                console.log(data);
                return undefined;
            });

    }; //end of getemailwiseAnalyticsData function


    //----------------------------------------------
    data.getEmail = function(email_id){

        var url = "http://"+hostname+"/emetrics/api/v1.0/email?emailid="+email_id;

        return $http.get(url)
            .then(
                function(response){
                    //console.log("success-"+JSON.stringify(response.data,null,4));
                    return response.data;
                }, 
                function(errResponse){
                    console.error('Error in fetching getTopEmailAnalytics');
                    return undefined;
                }
            );
    }; //end of getEmail function

	

	return data;
}]);