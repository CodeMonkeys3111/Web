'use strict';

describe('sorting the list of users', function() {
  it('sorts in descending order by default', function() {
    var users = ['jack', 'igor', 'jeff'];
    //    var sorted = sortUsers(users);
    //    expect(sorted).toEqual(['jeff', 'jack', 'igor']);
  });
});

describe('TodoCtrl', function() {
  beforeEach(module('todomvc'));
  // variables for injection
  var controller;
  var scope;
  var location;
  var firebaseArray;
  var sce;
  var localStorage;
  var window;

  // Injecting variables
  // http://stackoverflow.com/questions/13664144/how-to-unit-test-angularjs-controller-with-location-service
  beforeEach(inject(function($location,
    $rootScope,
    $controller,
    $firebaseArray,
    $localStorage,
    $sce,
    $window){
      // The injector unwraps the underscores (_) from around the parameter names when matching

      scope = $rootScope.$new();

      location = $location;
      controller = $controller;
      firebaseArray = $firebaseArray;
      sce = $sce;
      localStorage = $localStorage;
      window = $window;
    }));

    describe('TodoCtrl Testing', function() {
      it('setFirstAndRestSentence', function() {
        var ctrl = controller('TodoCtrl', {
          $scope: scope
        });

        var testInputs = [
          {str:"Hello? This is Sung", exp: "Hello?"},
          {str:"Hello.co? This is Sung", exp: "Hello.co?"},
          {str:"Hello.co This is Sung", exp: "Hello.co This is Sung"},
          {str:"Hello.co \nThis is Sung", exp: "Hello.co \n"},

          {str:"Hello?? This is Sung", exp: "Hello??"},
        ];

        for (var i in testInputs) {
          var results = scope.getFirstAndRestSentence(testInputs[i].str);
          expect(results[0]).toEqual(testInputs[i].exp);
        }
      });

      it('XssProtection',function(){
        var ctrl = controller('TodoCtrl',{
          $scope: scope
        });

        var testInputs2 = [
          {str:"<html>", exp: "&lt;html&gt;"},
          {str:'\"', exp: "&quot;"},
          {str:"#CodeMonkeys ", exp: "<strong>#CodeMonkeys</strong> "}, 
          {str:"#\n", exp: "<strong>#</strong>\n"},
          {str:'.', exp: "."}
        ];

        for (var j in testInputs2) {
          var results2= scope.XssProtection(testInputs2[j].str);
          expect(results2).toEqual(testInputs2[j].exp);
        }
      });

      it('RoomId', function() {
        location.path('/new/path');

        var ctrl = controller('TodoCtrl', {
          $scope: scope,
          $location: location
        });

        expect(scope.roomId).toBe("new");
      });

      it('toTop Testing', function() {

        var ctrl = controller('TodoCtrl', {
          $scope: scope,
          $location: location,
          $firebaseArray: firebaseArray,
          $sce: sce,
          $localStorage: localStorage,
          $window: window
        });

        scope.toTop();
        expect(window.scrollX).toBe(0);
        expect(window.scrollY).toBe(0);
      });

      it('increaseMax Testing', function(){
          var ctrl = controller('TodoCtrl', {
          $scope: scope
        });
        scope.maxQuestion = 0;
        scope.totalCount = 10;
        scope.increaseMax();
        expect(scope.maxQuestion).toEqual(10);
        scope.increaseMax();
        expect(scope.maxQuestion).toEqual(10);
      });

      it('FBLogout Testing', function(){
        var ctrl = controller('TodoCtrl', {
        $scope: scope
        });
        scope.isAdmin = true;
        scope.FBLogout();
        expect(scope.isAdmin).toEqual(false);
      });

      it('addTodo Testing', function(){
        var ctrl = controller('TodoCtrl', {
        $scope: scope
        });
        scope.input = { wholeMsg : ""};
        scope.addTodo();
        expect(scope.input.wholeMsg).toEqual("");
        
        scope.todos = {
          wholeMsg : ""
        };
        scope.input = { wholeMsg : "Hey, how are you doing my friend?"};
        scope.todos.$add = function(){
          scope.todos.wholeMsg = scope.input.wholeMsg
        };
        scope.addTodo();
        expect(scope.todos.wholeMsg).toEqual("Hey, how are you doing my friend?");
      });

      it('editTodo Testing', function(){
        var ctrl = controller('TodoCtrl', {
        $scope: scope
        });
        var todo = "Hey buddy!";
        scope.editedTodo = "";
        scope.originalTodo = {};
        scope.editTodo(todo);
        expect(scope.editedTodo).toEqual(todo);
        expect(scope.originalTodo).toEqual({});
      });

      it('addEcho Testing', function(){
        var ctrl = controller('TodoCtrl', {
        $scope: scope
        });
        var todo = {
          echo: "echoooo",
          order: 1
        }
        scope.editedTodo = "";
        scope.addEcho(todo);
        expect(scope.editedTodo).toEqual(todo);
      });

      it('doneEditing Testing', function(){
        var ctrl = controller('TodoCtrl', {
        $scope: scope
        });
        var todo = {
          wholeMsg: "Hey"
        }
        scope.editedTodo = "Hi bro";
        scope.doneEditing(todo);
        expect(scope.editedTodo).toEqual(null);
        var todo = {
          wholeMsg: "",
          removed: false
        }
        scope.removeTodo = function(todo){
          todo.remove = true;
        }
        scope.doneEditing(todo);
        expect(scope.editedTodo).toEqual(null);
      });

      it('revertEditing Testing', function(){
        var ctrl = controller('TodoCtrl', {
        $scope: scope
        });
        var todo = {
          wholeMsg: "Hey!"
        }
        scope.originalTodo = {
          wholeMsg : "Hey again!"
        }
        scope.revertEditing(todo);
        expect(todo.wholeMsg).toEqual(scope.originalTodo.wholeMsg);
      });


      it('clearCompletedTodos Testing', function(){
        var ctrl = controller('TodoCtrl', {
        $scope: scope
        });
        scope.counter = 0;
        scope.todos = [{completed: true,
        },
        {completed: true,
        },
        {completed: false, 
        },
        {completed: false,
        }]
        scope.todos.$remove = function(todo){
          scope.counter+=1} 
        scope.clearCompletedTodos();
        expect(scope.counter).toEqual(2);
      });

    });
  });
