'use strict';

var kazCtrl = angular.module('kazeon.controller',['ui.bootstrap']);


kazCtrl.controller("mainCtrl",function($scope,$rootScope,$timeout,emotionServices,$location,sharedData){

	$scope.ctrl = {};

  $scope.current_detail_user = sharedData.getData();

	$scope.test = {};
	$scope.test.colors = "anger";

  $scope.TopEmotion = {}

  $scope.colors = [ '#ff7f0e', '#ffbb78',  '#aec7e8','#1f77b4','#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#dbdb8d','#c7c7c7', '#bcbd22',  '#2ca02c','#17becf', '#9edae5'];

  $scope.shuffle = function (a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
  }

  $scope.shuffle($scope.colors);

	$scope.test = {
		'anger': 5.9216559675094986,
   		'anticipation': 23.651687846630857,
   		'disgust': 3.8691645923402769,
   		'fear': 8.0483863924188821,
   		'joy': 11.751604873575266,
   		'sadness': 6.5330363771343727,
   		'surprise': 6.8998646229092975,
   		'trust': 33.32459932748155
   	};

    $scope.testSent = {"positive": 65.160598220483379, "negative": 34.839401779516628}

    


   	$scope.getTopEmotion = function(emotions,index){

   		var sortable = [];
		for (var emo in emotions){
		    sortable.push([emo, emotions[emo]])
        }
        //console.log(sortable);
    		sortable.sort(function(a, b) {
    		    return a[1] - b[1]
    		})
		return sortable;
   	};

   	//$scope.getTopEmotion($scope.test);
    
    $scope.showGraph = function(index,data) {

    	$timeout(function(){

    		$scope.donu = c3.generate({
		        bindto: '#donut-'+index,
		        size: {
    					height: 140
    				},
		        data: {
		            columns: [
		                ['Positive', data['positive']],
		            	['Negative', data['negative']] 
		            ],
		            type: 'donut'
		        },
		        color: {
		            pattern: ['#29cc00', '#ff0000']
		        },
		    	  donut: {
		        	title: "Sentiment"
		    	  },
		    	  legend: {
					     show: false
				    }
    		}); 
    	});
    };


    $scope.showDetailSentGraph = function(data){

      $scope.donu = c3.generate({
            bindto: '#detailsent-donut',
            size: {
              height: 200
            },
            data: {
                columns: [
                    ['Positive', data['positive']],
                  ['Negative', data['negative']]
                ],
                type: 'donut'
            },
            color: {
                pattern: ['#29cc00', '#ff0000']
            },
            donut: {
              title: "Sentiment"
            }
        }); 

    }


    $scope.showEmotionBar = function(emodata){

      var showdataLabel= []
      var showdata = ["emotion"]
      for(var emo in emodata){

        showdataLabel.push(emo);
        showdata.push(emodata[emo].toFixed(2));
      }

      $scope.emobarchart = c3.generate({
        bindto: '#detailemo-bar',
        size: {
              height: 250
        },
        data: {
            columns: [
                showdata
            ],
            type: 'bar',
            color: function (color, d) {
                return $scope.colors[d.index];
            }
        },
        axis: {
         x:{
             type: 'category',
             categories: showdataLabel
         }
        }
      });

    }

    $scope.getEmailWiseAnalyticsData = function(){

        console.log("-----------getEmailWiseAnalyticsData--------------");
        emotionServices.getemailwiseAnalyticsData($scope.current_detail_user['user_email']).then(
        function (data){

            if(data !== undefined){

                sharedData.setEmailWiseAnalyticsData(data.data);
                console.log("-----------sebin--------------");
                //console.log("emailWiseAnalyticsData :"+JSON.stringify(data,null,4));
                $scope.showEmotionAnalysisGraph();
            }
            else{
                
                $scope.emailWiseAnalyticsData = undefined;
                //console.log("getEmailWiseData is undefined");
            }

        },
        function(error){

            //console.log("getEmailWiseData call failed");
            $scope.emailWiseAnalyticsData = undefined;
        }
    );

    }

    var stripEmailID = function(email){

      var email_id = email.split('.');
      email_id = email_id[0].substring(1);
      return email_id
    }

    $scope.setChartType = function(chtype){

      if(chtype === 'bar'){

        $scope.isBar = true;
      }
      else{

        $scope.isBar = false;
      }

      $scope.showEmotionAnalysisGraph();
    };

    $scope.isBar = true;

    $scope.showEmotionAnalysisGraph = function(){

      
      //console.log("-----------showEmotionAnalysisGraph--------------");  
      
      $scope.emailWiseAnalyticsData = sharedData.getEmailWiseAnalyticsData();

      var emotion_data = [];
      var sentiment_data = [];
      var anger_data = ["anger"];
      var anticipation_data = ["anticipation"];
      var disgust_data = ["disgust"];
      var fear_data = ["fear"];
      var joy_data = ["joy"];
      var sadness_data =["sadness"];
      var surprise_data = ["surprise"];
      var trust_data = ["trust"];
      var negative_data = ["negative"];
      var positive_data = ["positive"];
      var average_data = ["average"];
      var emailid_data = [];
      var emailid_data_label = [];


      //console.log(JSON.stringify($scope.emailWiseAnalyticsData,null,4));

      angular.forEach($scope.emailWiseAnalyticsData,function(email){

          //console.log(JSON.stringify(email,null,4));
          anger_data.push((email["emotion_percentile"]["anger"]*100).toFixed(2));
          anticipation_data.push((email.emotion_percentile.anticipation*100).toFixed(2));
          disgust_data.push((email.emotion_percentile.disgust*100).toFixed(2));
          fear_data.push((email.emotion_percentile.fear*100).toFixed(2));
          joy_data.push((email.emotion_percentile.joy*100).toFixed(2));
          sadness_data.push((email.emotion_percentile.sadness*100).toFixed(2));
          surprise_data.push((email.emotion_percentile.surprise*100).toFixed(2));
          
          negative_data.push((email.sentiment_percentile.negative*100).toFixed(2));
          positive_data.push((email.sentiment_percentile.positive*100).toFixed(2));
          emailid_data_label.push(stripEmailID(email.email_id));    
          emailid_data.push(email.email_id);  
          trust_data.push((email.emotion_percentile.trust*100).toFixed(2)); 
          var sum = Number((email["emotion_percentile"]["anger"]*100).toFixed(2)) + Number((email.emotion_percentile.anticipation*100).toFixed(2)) + Number((email.emotion_percentile.disgust*100).toFixed(2)) +
                     Number((email.emotion_percentile.fear*100).toFixed(2)) + Number((email.emotion_percentile.joy*100).toFixed(2)) + Number((email.emotion_percentile.sadness*100).toFixed(2)) +
                       Number((email.emotion_percentile.surprise*100).toFixed(2)) +  Number((email.emotion_percentile.trust*100).toFixed(2)) ;
          console.log(sum);
          var avg = sum/8;   
          average_data.push(avg.toFixed(2));        
           
      });


      emotion_data = [anger_data,anticipation_data,disgust_data,fear_data,joy_data,sadness_data,surprise_data,trust_data];
      sentiment_data = [negative_data,positive_data]

      console.log("---------------------------------");
      console.log(JSON.stringify(emotion_data,null,4));

      
      //$scope.isLine = true;

      if($scope.isBar){

        var graphDataMapper = {
            columns: emotion_data,
            type: 'bar',
            onclick: function (d) {
                //alert('hello from chart');
                $scope.selectedEmailid = emailid_data[d['index']];
                $scope.getEmail($scope.selectedEmailid);
            }
        };

      }
      else if(!$scope.isBar){

        console.log(JSON.stringify(average_data,null,4));
        var graphDataMapper = {
            columns: [average_data],
            type: 'spline',
            onclick: function (d) {
                //alert('hello from chart');
                $scope.selectedEmailid = emailid_data[d['index']];
                $scope.getEmail($scope.selectedEmailid);
            }
        };
      }
      


      $scope.emobarchart = c3.generate({
        bindto: '#emoanalysis-bar',
        size: {
              height: 350,
              width : 10000
        },
        data: graphDataMapper,
        axis: {
         x:{
             type: 'category',
             categories: emailid_data_label
         }
        },
        grid: {
          y: {
              lines: [{value:0}]
          }
        }
      });

    };


    
    // Getting the scriptconfig file from the server
    emotionServices.getTopEmailAnalytics().then(
        function (data){

            if(data !== undefined){

                $scope.TopEmailAnalytics = data;
                //console.log("scriptconfig :"+JSON.stringify(data,null,4));
            }
            else{
                
                $scope.scriptconfig = undefined;
                //console.log("scriptconfig is undefined");
            }

        },
        function(error){

            //console.log("scriptconfig call failed");
            $scope.scriptconfig = undefined;
        }
    );

    $scope.setFrequentRecipients = function(){

      if($scope.current_detail_user !== undefined){

        emotionServices.getFrequentRecipients($scope.current_detail_user['user_email']).then(

          function (data){

              if(data !== undefined){

                  $scope.freqRecipients = data.data;
                  //console.log("scriptconfig :"+JSON.stringify($scope.freqRecipients,null,4));
                  $scope.prepareGraphData();
              }
              else{
                  
                  $scope.freqRecipients = undefined;
                  //console.log("scriptconfig is undefined");
              }

          },
          function(error){

              //console.log("scriptconfig call failed");
              $scope.freqRecipients = undefined;
          }
        );
      }
      
    }
    
    $scope.prepareGraphData = function(){

      $scope.graphdata = {};
      $scope.graphdata['nodes'] = [];
      $scope.graphdata['links'] = [];
      $scope.graphdata['nodes'].push({"name":$scope.current_detail_user['user_email'],"group":1});

      $scope.freqRecipients.forEach(function (value, i) {

          $scope.graphdata['nodes'].push({"name":value[0],"group":2});
          $scope.graphdata['links'].push({"source":0,"target":i,"value":1});
      });

      //console.log("-------------preepare-----------------");
      //console.log(JSON.stringify($scope.graphdata,null,4));
    }


    $scope.setUserDetails = function(user){

      sharedData.setData(user);
      $location.path('/user_detail')    
    }


    $scope.getFilteredAnalytics = function(last_n_filter){

      emotionServices.getFilteredUserAnalytics($scope.current_detail_user['user_email'],$scope.current_detail_user['email_count'],last_n_filter).then(
        function (data){

            if(data !== undefined){

                $scope.current_detail_user = data.data;
                console.log("scriptconfig :"+JSON.stringify($scope.current_detail_user,null,4));
                $scope.showEmotionBar($scope.current_detail_user['emotion']);
                $scope.showDetailSentGraph($scope.current_detail_user['sentiment']);
            }
            else{
                
                $scope.current_detail_user = undefined;
                //console.log("scriptconfig is undefined");
            }

        },
        function(error){

            //console.log("scriptconfig call failed");
            $scope.current_detail_user = undefined;
        }
      );
    }


    $scope.setFrequentRecipients();


    $scope.showEmotionAnalysis =function(){

        console.log("--------sadas------------------sdas");
        // /$scope.getEmailWiseAnalyticsData();
        $location.path('/user_emotion_analysis');
    }


    $scope.getEmail = function(email_id){

      emotionServices.getEmail(email_id).then(

          function (data){

              if(data !== undefined){

                  $scope.selectedEmail = data;
                  //console.log("scriptconfig :"+JSON.stringify($scope.selectedEmail,null,4));
                  //console.log("selected email id "+JSON.stringify($scope.selectedEmail,null,4));
              }
              else{
                  
                  $scope.selectedEmail = undefined;
                  //console.log("scriptconfig is undefined");
              }

          },
          function(error){

              //console.log("scriptconfig call failed");
              $scope.selectedEmail = undefined;
          }
        );

    }










    var color = d3.scale.category20()
    $scope.options = {
        chart: {
            type: 'forceDirectedGraph',
            height: 680,
            width: (function(){ return nv.utils.windowSize().width })(),
            margin:{top: 20, right: 20, bottom: 20, left: 20},
            color: function(d){
                //console.log(JSON.stringify(d,null,4));
                if(d.group == 2){
                  return '#800080';
                }
                else{

                  return color(d.group);
                }
                
            },
            nodeExtras: function(node) {
                node && node
                  .append("text")
                  .attr("dx", 8)
                  .attr("dy", ".35em")
                  .text(function(d) { return d.name })
                  .style('font-size', '10px');
            }
        }
    };
    
    $scope.data = {
        "nodes":[
            {"name":"Myriel","group":1},
            {"name":"Napoleon","group":1},
            {"name":"Mlle.Baptistine","group":1},
            {"name":"Mme.Magloire","group":1},
            {"name":"CountessdeLo","group":1},
            {"name":"Geborand","group":1},
            {"name":"Champtercier","group":1},
            {"name":"Cravatte","group":1},
            {"name":"Count","group":1},
            {"name":"OldMan","group":1},
            {"name":"Labarre","group":2},
            {"name":"Valjean","group":2},
            {"name":"Marguerite","group":3},
            {"name":"Mme.deR","group":2},
            {"name":"Isabeau","group":2},
            {"name":"Gervais","group":2},
            {"name":"Tholomyes","group":3},
            {"name":"Listolier","group":3},
            {"name":"Fameuil","group":3},
            {"name":"Blacheville","group":3},
            {"name":"Favourite","group":3},
            {"name":"Dahlia","group":3},
            {"name":"Zephine","group":3},
            {"name":"Fantine","group":3},
            {"name":"Mme.Thenardier","group":4},
            {"name":"Thenardier","group":4},
            {"name":"Cosette","group":5},
            {"name":"Javert","group":4},
            {"name":"Fauchelevent","group":0},
            {"name":"Bamatabois","group":2},
            {"name":"Perpetue","group":3},
            {"name":"Simplice","group":2},
            {"name":"Scaufflaire","group":2},
            {"name":"Woman1","group":2},
            {"name":"Judge","group":2},
            {"name":"Champmathieu","group":2},
            {"name":"Brevet","group":2},
            {"name":"Chenildieu","group":2},
            {"name":"Cochepaille","group":2},
            {"name":"Pontmercy","group":4},
            {"name":"Boulatruelle","group":6},
            {"name":"Eponine","group":4},
            {"name":"Anzelma","group":4},
            {"name":"Woman2","group":5},
            {"name":"MotherInnocent","group":0},
            {"name":"Gribier","group":0},
            {"name":"Jondrette","group":7},
            {"name":"Mme.Burgon","group":7},
            {"name":"Gavroche","group":8},
            {"name":"Gillenormand","group":5},
            {"name":"Magnon","group":5},
            {"name":"Mlle.Gillenormand","group":5},
            {"name":"Mme.Pontmercy","group":5},
            {"name":"Mlle.Vaubois","group":5},
            {"name":"Lt.Gillenormand","group":5},
            {"name":"Marius","group":8},
            {"name":"BaronessT","group":5},
            {"name":"Mabeuf","group":8},
            {"name":"Enjolras","group":8},
            {"name":"Combeferre","group":8},
            {"name":"Prouvaire","group":8},
            {"name":"Feuilly","group":8},
            {"name":"Courfeyrac","group":8},
            {"name":"Bahorel","group":8},
            {"name":"Bossuet","group":8},
            {"name":"Joly","group":8},
            {"name":"Grantaire","group":8},
            {"name":"MotherPlutarch","group":9},
            {"name":"Gueulemer","group":4},
            {"name":"Babet","group":4},
            {"name":"Claquesous","group":4},
            {"name":"Montparnasse","group":4},
            {"name":"Toussaint","group":5},
            {"name":"Child1","group":10},
            {"name":"Child2","group":10},
            {"name":"Brujon","group":4},
            {"name":"Mme.Hucheloup","group":8}
        ],
        "links":[
            {"source":1,"target":0,"value":1},
            {"source":2,"target":0,"value":8},
            {"source":3,"target":0,"value":10},
            {"source":3,"target":2,"value":6},
            {"source":4,"target":0,"value":1},
            {"source":5,"target":0,"value":1},
            {"source":6,"target":0,"value":1},
            {"source":7,"target":0,"value":1},
            {"source":8,"target":0,"value":2},
            {"source":9,"target":0,"value":1},
            {"source":11,"target":10,"value":1},
            {"source":11,"target":3,"value":3},
            {"source":11,"target":2,"value":3},
            {"source":11,"target":0,"value":5},
            {"source":12,"target":11,"value":1},
            {"source":13,"target":11,"value":1},
            {"source":14,"target":11,"value":1},
            {"source":15,"target":11,"value":1},
            {"source":17,"target":16,"value":4},
            {"source":18,"target":16,"value":4},
            {"source":18,"target":17,"value":4},
            {"source":19,"target":16,"value":4},
            {"source":19,"target":17,"value":4},
            {"source":19,"target":18,"value":4},
            {"source":20,"target":16,"value":3},
            {"source":20,"target":17,"value":3},
            {"source":20,"target":18,"value":3},
            {"source":20,"target":19,"value":4},
            {"source":21,"target":16,"value":3},
            {"source":21,"target":17,"value":3},
            {"source":21,"target":18,"value":3},
            {"source":21,"target":19,"value":3},
            {"source":21,"target":20,"value":5},
            {"source":22,"target":16,"value":3},
            {"source":22,"target":17,"value":3},
            {"source":22,"target":18,"value":3},
            {"source":22,"target":19,"value":3},
            {"source":22,"target":20,"value":4},
            {"source":22,"target":21,"value":4},
            {"source":23,"target":16,"value":3},
            {"source":23,"target":17,"value":3},
            {"source":23,"target":18,"value":3},
            {"source":23,"target":19,"value":3},
            {"source":23,"target":20,"value":4},
            {"source":23,"target":21,"value":4},
            {"source":23,"target":22,"value":4},
            {"source":23,"target":12,"value":2},
            {"source":23,"target":11,"value":9},
            {"source":24,"target":23,"value":2},
            {"source":24,"target":11,"value":7},
            {"source":25,"target":24,"value":13},
            {"source":25,"target":23,"value":1},
            {"source":25,"target":11,"value":12},
            {"source":26,"target":24,"value":4},
            {"source":26,"target":11,"value":31},
            {"source":26,"target":16,"value":1},
            {"source":26,"target":25,"value":1},
            {"source":27,"target":11,"value":17},
            {"source":27,"target":23,"value":5},
            {"source":27,"target":25,"value":5},
            {"source":27,"target":24,"value":1},
            {"source":27,"target":26,"value":1},
            {"source":28,"target":11,"value":8},
            {"source":28,"target":27,"value":1},
            {"source":29,"target":23,"value":1},
            {"source":29,"target":27,"value":1},
            {"source":29,"target":11,"value":2},
            {"source":30,"target":23,"value":1},
            {"source":31,"target":30,"value":2},
            {"source":31,"target":11,"value":3},
            {"source":31,"target":23,"value":2},
            {"source":31,"target":27,"value":1},
            {"source":32,"target":11,"value":1},
            {"source":33,"target":11,"value":2},
            {"source":33,"target":27,"value":1},
            {"source":34,"target":11,"value":3},
            {"source":34,"target":29,"value":2},
            {"source":35,"target":11,"value":3},
            {"source":35,"target":34,"value":3},
            {"source":35,"target":29,"value":2},
            {"source":36,"target":34,"value":2},
            {"source":36,"target":35,"value":2},
            {"source":36,"target":11,"value":2},
            {"source":36,"target":29,"value":1},
            {"source":37,"target":34,"value":2},
            {"source":37,"target":35,"value":2},
            {"source":37,"target":36,"value":2},
            {"source":37,"target":11,"value":2},
            {"source":37,"target":29,"value":1},
            {"source":38,"target":34,"value":2},
            {"source":38,"target":35,"value":2},
            {"source":38,"target":36,"value":2},
            {"source":38,"target":37,"value":2},
            {"source":38,"target":11,"value":2},
            {"source":38,"target":29,"value":1},
            {"source":39,"target":25,"value":1},
            {"source":40,"target":25,"value":1},
            {"source":41,"target":24,"value":2},
            {"source":41,"target":25,"value":3},
            {"source":42,"target":41,"value":2},
            {"source":42,"target":25,"value":2},
            {"source":42,"target":24,"value":1},
            {"source":43,"target":11,"value":3},
            {"source":43,"target":26,"value":1},
            {"source":43,"target":27,"value":1},
            {"source":44,"target":28,"value":3},
            {"source":44,"target":11,"value":1},
            {"source":45,"target":28,"value":2},
            {"source":47,"target":46,"value":1},
            {"source":48,"target":47,"value":2},
            {"source":48,"target":25,"value":1},
            {"source":48,"target":27,"value":1},
            {"source":48,"target":11,"value":1},
            {"source":49,"target":26,"value":3},
            {"source":49,"target":11,"value":2},
            {"source":50,"target":49,"value":1},
            {"source":50,"target":24,"value":1},
            {"source":51,"target":49,"value":9},
            {"source":51,"target":26,"value":2},
            {"source":51,"target":11,"value":2},
            {"source":52,"target":51,"value":1},
            {"source":52,"target":39,"value":1},
            {"source":53,"target":51,"value":1},
            {"source":54,"target":51,"value":2},
            {"source":54,"target":49,"value":1},
            {"source":54,"target":26,"value":1},
            {"source":55,"target":51,"value":6},
            {"source":55,"target":49,"value":12},
            {"source":55,"target":39,"value":1},
            {"source":55,"target":54,"value":1},
            {"source":55,"target":26,"value":21},
            {"source":55,"target":11,"value":19},
            {"source":55,"target":16,"value":1},
            {"source":55,"target":25,"value":2},
            {"source":55,"target":41,"value":5},
            {"source":55,"target":48,"value":4},
            {"source":56,"target":49,"value":1},
            {"source":56,"target":55,"value":1},
            {"source":57,"target":55,"value":1},
            {"source":57,"target":41,"value":1},
            {"source":57,"target":48,"value":1},
            {"source":58,"target":55,"value":7},
            {"source":58,"target":48,"value":7},
            {"source":58,"target":27,"value":6},
            {"source":58,"target":57,"value":1},
            {"source":58,"target":11,"value":4},
            {"source":59,"target":58,"value":15},
            {"source":59,"target":55,"value":5},
            {"source":59,"target":48,"value":6},
            {"source":59,"target":57,"value":2},
            {"source":60,"target":48,"value":1},
            {"source":60,"target":58,"value":4},
            {"source":60,"target":59,"value":2},
            {"source":61,"target":48,"value":2},
            {"source":61,"target":58,"value":6},
            {"source":61,"target":60,"value":2},
            {"source":61,"target":59,"value":5},
            {"source":61,"target":57,"value":1},
            {"source":61,"target":55,"value":1},
            {"source":62,"target":55,"value":9},
            {"source":62,"target":58,"value":17},
            {"source":62,"target":59,"value":13},
            {"source":62,"target":48,"value":7},
            {"source":62,"target":57,"value":2},
            {"source":62,"target":41,"value":1},
            {"source":62,"target":61,"value":6},
            {"source":62,"target":60,"value":3},
            {"source":63,"target":59,"value":5},
            {"source":63,"target":48,"value":5},
            {"source":63,"target":62,"value":6},
            {"source":63,"target":57,"value":2},
            {"source":63,"target":58,"value":4},
            {"source":63,"target":61,"value":3},
            {"source":63,"target":60,"value":2},
            {"source":63,"target":55,"value":1},
            {"source":64,"target":55,"value":5},
            {"source":64,"target":62,"value":12},
            {"source":64,"target":48,"value":5},
            {"source":64,"target":63,"value":4},
            {"source":64,"target":58,"value":10},
            {"source":64,"target":61,"value":6},
            {"source":64,"target":60,"value":2},
            {"source":64,"target":59,"value":9},
            {"source":64,"target":57,"value":1},
            {"source":64,"target":11,"value":1},
            {"source":65,"target":63,"value":5},
            {"source":65,"target":64,"value":7},
            {"source":65,"target":48,"value":3},
            {"source":65,"target":62,"value":5},
            {"source":65,"target":58,"value":5},
            {"source":65,"target":61,"value":5},
            {"source":65,"target":60,"value":2},
            {"source":65,"target":59,"value":5},
            {"source":65,"target":57,"value":1},
            {"source":65,"target":55,"value":2},
            {"source":66,"target":64,"value":3},
            {"source":66,"target":58,"value":3},
            {"source":66,"target":59,"value":1},
            {"source":66,"target":62,"value":2},
            {"source":66,"target":65,"value":2},
            {"source":66,"target":48,"value":1},
            {"source":66,"target":63,"value":1},
            {"source":66,"target":61,"value":1},
            {"source":66,"target":60,"value":1},
            {"source":67,"target":57,"value":3},
            {"source":68,"target":25,"value":5},
            {"source":68,"target":11,"value":1},
            {"source":68,"target":24,"value":1},
            {"source":68,"target":27,"value":1},
            {"source":68,"target":48,"value":1},
            {"source":68,"target":41,"value":1},
            {"source":69,"target":25,"value":6},
            {"source":69,"target":68,"value":6},
            {"source":69,"target":11,"value":1},
            {"source":69,"target":24,"value":1},
            {"source":69,"target":27,"value":2},
            {"source":69,"target":48,"value":1},
            {"source":69,"target":41,"value":1},
            {"source":70,"target":25,"value":4},
            {"source":70,"target":69,"value":4},
            {"source":70,"target":68,"value":4},
            {"source":70,"target":11,"value":1},
            {"source":70,"target":24,"value":1},
            {"source":70,"target":27,"value":1},
            {"source":70,"target":41,"value":1},
            {"source":70,"target":58,"value":1},
            {"source":71,"target":27,"value":1},
            {"source":71,"target":69,"value":2},
            {"source":71,"target":68,"value":2},
            {"source":71,"target":70,"value":2},
            {"source":71,"target":11,"value":1},
            {"source":71,"target":48,"value":1},
            {"source":71,"target":41,"value":1},
            {"source":71,"target":25,"value":1},
            {"source":72,"target":26,"value":2},
            {"source":72,"target":27,"value":1},
            {"source":72,"target":11,"value":1},
            {"source":73,"target":48,"value":2},
            {"source":74,"target":48,"value":2},
            {"source":74,"target":73,"value":3},
            {"source":75,"target":69,"value":3},
            {"source":75,"target":68,"value":3},
            {"source":75,"target":25,"value":3},
            {"source":75,"target":48,"value":1},
            {"source":75,"target":41,"value":1},
            {"source":75,"target":70,"value":1},
            {"source":75,"target":71,"value":1},
            {"source":76,"target":64,"value":1},
            {"source":76,"target":65,"value":1},
            {"source":76,"target":66,"value":1},
            {"source":76,"target":63,"value":1},
            {"source":76,"target":62,"value":1},
            {"source":76,"target":48,"value":1},
            {"source":76,"target":58,"value":1}
        ]
    }

});


kazCtrl.controller("detailCtrl",function($scope,emotionServices){



});