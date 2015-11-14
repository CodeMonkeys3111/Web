/*global todomvc, angular, Firebase */
'use strict';

/**
* The main controller for the app. The controller:
* - retrieves and persists the model via the $firebaseArray service
* - exposes the model to the template and provides event handlers
*/
todomvc.controller('TodoCtrl',
['$scope', '$location', '$firebaseArray', '$sce', '$localStorage', '$window',
function ($scope, $location, $firebaseArray, $sce, $localStorage, $window) {
	// set local storage
	$scope.$storage = $localStorage;

	// set max number of questions
	var scrollCountDelta = 10;
	$scope.maxQuestion = scrollCountDelta;
	$scope.maxReply = 2;

	/* 
	$(window).scroll(function(){
		if($(window).scrollTop() > 0) {
			$("#btn_top").show();
		} else {
			$("#btn_top").hide();
		} 
	});
	*/


var splits = $location.path().trim().split("/");
var roomId = angular.lowercase(splits[1]);
if (!roomId || roomId.length === 0) {
	roomId = "all";
}

// Kaichen's firebase account
var firebaseURL = "https://cmkquestionsdb.firebaseio.com/";

// create variables for firebase DB
$scope.roomId = roomId;
var url = firebaseURL + roomId + "/questions/";
var urlReplies = firebaseURL + roomId + "/replies/";
var echoRef = new Firebase(url);
var echoRefReplies = new Firebase(urlReplies);

var query = echoRef.orderByChild("order");
var queryReplies = echoRefReplies.orderByChild("order");

// TODO: Should we limit?
//.limitToFirst(1000);
$scope.todos = $firebaseArray(query);
$scope.todosReplies = $firebaseArray(queryReplies);

$scope.editedTodo = null;

// default sorting settings
if($scope.predicate == undefined) {
	$scope.predicate = 'timestamp';
	$scope.predicateText = 'Most Recent';
	$scope.reverse = true;
}


// pre-processing for collection - Questions
$scope.$watchCollection('todos', function () {
	var total = 0;
	var remaining = 0;
	$scope.todos.forEach(function (todo) {
		// Skip invalid entries so they don't break the entire app.
		if (!todo || !todo.head ) {
			return;
		}
		
		total++;
		if (todo.completed === false) {
			remaining++;
		}
		
		// TODO: create tags for head and desc
		// see http://www.w3schools.com/jsref/jsref_concat_array.asp
		//var tagsDesc = todo.desc.match(/#\w+/g);
		//var tagsHead = todo.head.match(/#\w+/g);
		//todo.tags = tagsHead.concat(tagsDesc); 
		
		todo.tags = todo.head.match(/#\w+/g); // find all # plus the following word characters);
		
		// changes before here will be stored in DB
		// changes after will not
		$scope.todos.$save(todo);
		
	});

	$scope.totalCount = total;
	$scope.remainingCount = remaining;
	$scope.completedCount = total - remaining;
	$scope.allChecked = remaining === 0;
	$scope.absurl = $location.absUrl();
}, true);

// pre-processing for collection - Replies
$scope.$watchCollection('todosReplies', function () {

	$scope.todosReplies.forEach(function (reply) {

	});

}, true);



// Post question
$scope.doAsk = function () {
	
	var head = $scope.input.head.trim();
	
	var desc = "";
	var descInput = $scope.input.desc.trim()

	// Only change desc if there is one
	// TODO: issue - the first question always needs a desc.
	if (descInput.length) {
		desc = descInput;
	}
	
	// add to DB array
	$scope.todos.$add({
		wholeMsgReply: '',
		head: head,
		desc: desc,
		completed: false,
		timestamp: new Date().getTime(),
		tags: "...",
		like: 0,
		dislike: 0,
		order: 0,
		replies: 0
	});
	// remove the posted question in the input
	$scope.input.head = '';
	$scope.input.desc = '';
};


// Reply to Question
$scope.doReply = function (todo) {
	
	var newTodo = todo.wholeMsgReply.trim();
	
	// No input, so just do nothing
	if (!newTodo.length) {
		return;
	}
	
	// update replies counter of the corresponding question
	$scope.editedTodo = todo;
	todo.replies = todo.replies + 1;
	$scope.todos.$save(todo);
	
	// TODO: Seems to be superfluous if not trusting the desc as HTML anyway
	var desc = $scope.XssProtection(newTodo);
	
	// add to DB array
	$scope.todosReplies.$add({
		desc: desc,
		timestamp: new Date().getTime(),
		order: 0,
		parentID: todo.$id,
	});
	
	// remove the posted question in the input
	todo.wholeMsgReply = '';
	$scope.todos.$save(todo);
	
};



$scope.editTodo = function (todo) {
	$scope.editedTodo = todo;
	$scope.originalTodo = angular.extend({}, $scope.editedTodo);
};

$scope.isNew = function (todo) {
	if (todo.timestamp > new Date().getTime() - 180000) { // 3min
		return true;
	} else {
		return false;
	}
};

$scope.doLike = function (todo) {
	$scope.editedTodo = todo;
	todo.like = todo.like + 1;
	// Hack to order using this order.
	todo.order = todo.order - 1;
	$scope.todos.$save(todo);

	// Disable the button
	$scope.$storage[todo.$id] = "echoed";
};

$scope.doDislike = function (todo) {
	$scope.editedTodo = todo;
	todo.dislike = todo.dislike + 1;
	// Hack to order using this order.
	todo.order = todo.order + 1;
	$scope.todos.$save(todo);

	// Disable the button
	$scope.$storage[todo.$id] = "echoed";
};

$scope.doLikeReply = function (reply) {
	$scope.editedReply = reply;
	// Hack to order using this order.
	reply.order = reply.order - 1;
	$scope.todosReplies.$save(reply);

	// Disable the button
	$scope.$storage[reply.$id] = "echoed";
};

$scope.doDislikeReply = function (reply) {
	$scope.editedReply = reply;
	// Hack to order using this order.
	reply.order = reply.order + 1;
	$scope.todosReplies.$save(reply);

	// Disable the button
	$scope.$storage[reply.$id] = "echoed";
};

$scope.doneEditing = function (todo) {
	$scope.editedTodo = null;
	var head = todo.head.trim();
	if (head) {
		$scope.todos.$save(todo);
	} else {
		$scope.removeTodo(todo);
	}
};

$scope.revertEditing = function (todo) {
	todo.head = $scope.originalTodo.head;
	$scope.doneEditing(todo);
};

$scope.removeTodo = function (todo) {
	$scope.todos.$remove(todo);
};

$scope.clearCompletedTodos = function () {
	$scope.todos.forEach(function (todo) {
		if (todo.completed) {
			$scope.removeTodo(todo);
		}
	});
};

$scope.toggleCompleted = function (todo) {
	todo.completed = !todo.completed;
	$scope.todos.$save(todo);
};

$scope.markAll = function (allCompleted) {
	$scope.todos.forEach(function (todo) {
		todo.completed = allCompleted;
		$scope.todos.$save(todo);
	});
};

$scope.FBLogin = function () {
	var ref = new Firebase(firebaseURL);
	ref.authWithOAuthPopup("facebook", function(error, authData) {
		if (error) {
			console.log("Login Failed!", error);
		} else {
			$scope.$apply(function() {
				$scope.$authData = authData;
				$scope.isAdmin = true;
			});
			console.log("Authenticated successfully with payload:", authData);
		}
	});
};

$scope.FBLogout = function () {
	var ref = new Firebase(firebaseURL);
	ref.unauth();
	delete $scope.$authData;
	$scope.isAdmin = false;
};

$scope.increaseMax = function () {
	if ($scope.maxQuestion < $scope.totalCount) {
		$scope.maxQuestion+=scrollCountDelta;
	}
};

$scope.toTop =function toTop() {
	$window.scrollTo(0,0);
};

$scope.setSorting = function(predicate, predicateText){
	//if(predicate == $scope.predicate){ //both is -predicate
	//	$scope.predicate = predicate.substr(1);
	//}
	//else{
	//	$scope.predicate = predicate;
	//}
	
	$scope.predicateText = predicateText;
    $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
    $scope.predicate = predicate;
	  
};

// Not sure what is this code. Todel
if ($location.path() === '') {
	$location.path('/');
}
$scope.location = $location;

// autoscroll
angular.element($window).bind("scroll", function() {
	if ($window.innerHeight + $window.scrollY >= $window.document.body.offsetHeight) {
		console.log('Hit the bottom2. innerHeight' +
		$window.innerHeight + "scrollY" +
		$window.scrollY + "offsetHeight" + $window.document.body.offsetHeight);

		// update the max value
		$scope.increaseMax();

		// force to update the view (html)
		$scope.$apply();
	}
});

$scope.XssProtection = function($string) {
    //var filteredMsg = "<pre>";
	var filteredMsg = '';
    var inHashtag = false;
    for (var i = 0; i < $string.length; ++i) {
		var ch = $string.charAt(i);
		if (ch == '<') {
	    	filteredMsg+="&lt;";
		} else if (ch == '>') {
	    	filteredMsg+="&gt;";
		} else if (ch == '\"') {
	    	filteredMsg+="&quot;";
		} else if (ch == '#' && !inHashtag) {
	    	inHashtag = true;
	    	filteredMsg+="<strong>"+ch;
		} else if (inHashtag && (ch == ' ' || ch == '\n')) {
	    	inHashtag = false;
	    	filteredMsg+="</strong>"+ch;
		} else {
	    	filteredMsg+=ch;
		}
    }
    //filteredMsg+="</pre>";
    return filteredMsg;
};

}]);
