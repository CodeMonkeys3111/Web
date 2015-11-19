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
// Restructure the room as an object
var room = {
    roomid: angular.lowercase(splits[1]),
};
//var roomId = angular.lowercase(splits[1]);
if (!room.roomid || room.roomid.length === 0) {
	room.roomid = "all";
};

// Kaichen's firebase account
var firebaseURL = "https://cmkquestionsdb.firebaseio.com/";
// Backup DB (TEST ONLY)
//var firebaseURL = "https://questionstestdb.firebaseio.com/";

// create variables for firebase DB

$scope.roomId = room.roomid;
var urlQuestions = firebaseURL + "rooms/" + room.roomid + "/questions/";
var urlReplies = firebaseURL + "rooms/" + room.roomid + "/replies/";
var urlTags = firebaseURL + "rooms/" + room.roomid + "/tags/";
var echoRefQuestions = new Firebase(urlQuestions);
var echoRefReplies = new Firebase(urlReplies);
var echoRefTags = new Firebase(urlTags);

var queryQuestions = echoRefQuestions.orderByChild("order");	// TODO: adapt once removing the 'order' attribute
var queryReplies = echoRefReplies.orderByChild("order");
var queryTags = echoRefTags.orderByChild("used");
var queryPopularTags = echoRefTags.orderByChild("used").limitToLast(5);

$scope.todos = $firebaseArray(queryQuestions);
$scope.todosReplies = $firebaseArray(queryReplies);
$scope.todosTags = $firebaseArray(queryTags);
$scope.todosPopularTags = $firebaseArray(queryPopularTags);
// TODO: find a way to invert order. todosPopularTags.reverse() does not work...

$scope.editedTodo = null;

// default sorting settings
if($scope.predicate == undefined) {
	$scope.predicate = 'timestamp';
	$scope.predicateText = 'Date';
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
    
$scope.createPrivateRoom = function(){
    
}


// pre-processing for collection - Tags
$scope.$watchCollection('todosReplies', function () {

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
	
	
	// extract hashtags from questions
	var tagsHead = head.match(/#\w+/g);
	if (tagsHead == null)
		tagsHead = [];	// intialize to avoid error using concat
	
	var tagsDesc = desc.match(/#\w+/g);
	if (tagsDesc == null)
		tagsDesc = [];
	// concatenate hasthags from head and desc
	var tags = tagsHead.concat(tagsDesc);
	
	// convert all letters of tags to lowercase
	tags.forEach(function(part, index) {
		tags[index] = part.toLowerCase();
	});
	
	// add to question array
	$scope.todos.$add({
		wholeMsgReply: '',
		head: head,
		desc: desc,
		completed: false,
		timestamp: new Date().getTime(),
		tags: tags,
		like: 0,
		dislike: 0,
		order: 0,
		replies: 0
	});
	// remove the posted question in the input
	$scope.input.head = '';
	$scope.input.desc = '';
	
	// add to tags array
	
	// iterate current tags
	tags.forEach(function (tagCurrent) {
		var isNew = 1;
		//window.alert('in tags.forEach for tagCurrent=' + tagCurrent + ' with isNew=' + isNew);
		
		// iterate database tags
		$scope.todosTags.forEach(function(tagStored) {
			//window.alert("in todosTags.forEach for tagStored.name=" + tagStored.name);
			if(tagCurrent ==tagStored.name) { 
				//window.alert("entered if.");
				// increase counter if tag already exists
				tagStored.used = tagStored.used + 1;
				$scope.todosTags.$save(tagStored);
				isNew = 0;
				//break; // TODO: find a break in javascript
				//window.alert("isNew=0");
			}
			//window.alert("passed if.");
		});
		// add tag if it is new
		//window.alert('Currently, isNew=' + isNew);
		if(isNew == 1) {
			$scope.todosTags.$add({
				name: tagCurrent,
				used: 1
			});
			//window.alert("isNew=1");
		}		
	});	

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
	//var desc = $scope.XssProtection(newTodo);
	
	// add to reply array
	$scope.todosReplies.$add({
		desc: newTodo,
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

$scope.addTagToSearch = function(tag) {
	try{
		if ($scope.input.head.trim())
			var Msg = $scope.input.head.trim() + " " + tag;
		else
			var Msg = tag;
	}
	catch(e){
		var Msg = tag;
	}
	$scope.input = {head: Msg};
}

$scope.XssProtection = function($string) {
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
    return filteredMsg;
};

}]);
