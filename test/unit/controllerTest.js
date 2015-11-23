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

      it('doAsk Testing', function(){
        var ctrl = controller('TodoCtrl', {
        $scope: scope
        });
        scope.input = { 
          head : "testing head",
          desc: "testing desc"
        };
        scope.todos.$add = function(){
          scope.todos.head = scope.input.head
          scope.todos.desc = scope.input.desc
        };
        scope.doAsk();
        expect(scope.todos.head).toEqual("testing head");
        expect(scope.todos.desc).toEqual("testing desc");
        expect(scope.input.head).toEqual("");
        expect(scope.input.desc).toEqual("");
      });

      it('doReply Testing', function(){
        var ctrl = controller('TodoCtrl', {
        $scope: scope
        });

        var todo = {
          wholeMsgReply: "",
          replies: 0
        }
        scope.doReply(todo);
        expect(todo.replies).toEqual(0);

        /*
        var todo = {
          wholeMsgReply: "This is a reply",
          replies: 0
        }
        scope.editedTodo = "Greetings";
        scope.todosReplies.add = function(){
          scope.todosReplies.desc = todo.wholeMsgReply
        };
        scope.doReply(todo);
        expect(scope.todos.desc).toEqual("This is a reply");
        expect(todo.wholeMsgReply).toEqual("");
        
        */
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

      it('doneEditing Testing', function(){
        var ctrl = controller('TodoCtrl', {
        $scope: scope
        });
        var todo = {
          head: "Hey"
        }
        scope.editedTodo = "Hi bro";
        scope.doneEditing(todo);
        expect(scope.editedTodo).toEqual(null);
        var todo = {
          head: "",
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
          head: "Hey!"
        }
        scope.originalTodo = {
          head : "Hey again!"
        }
        scope.revertEditing(todo);
        expect(todo.head).toEqual(scope.originalTodo.head);
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

      it('doLike Testing', function(){
        var ctrl = controller('TodoCtrl', {
        $scope: scope
        });
        var todo = {
          like: 0,
          order: 1
        }
        scope.doLike(todo);
        expect(todo.like).toEqual(1);
        expect(todo.order).toEqual(0);
      })

      it('doDislike Testing', function(){
        var ctrl = controller('TodoCtrl', {
        $scope: scope
        });
        var todo = {
          dislike: 0,
          order: 0
        }
        scope.doDislike(todo);
        expect(todo.dislike).toEqual(1);
        expect(todo.order).toEqual(1);
      })

      it('toggleCompleted Testing', function(){
        var ctrl = controller('TodoCtrl', {
        $scope: scope
        });
        var todo = {
          completed: true
        }
        scope.toggleCompleted(todo);
        expect(todo.completed).toEqual(false);
      })
      /*
      it('markAll Testing', function(){
        var ctrl = controller('TodoCtrl', {
        $scope: scope
        });
        scope.todos = [{completed: true,
        },
        {completed: true,
        },
        {completed: false, 
        },
        {completed: false,
        }];
        scope.todos.$save = function(todo){} 
        scope.markAll(false);
        expect(todos[0].completed).toEqual(false);
      })
      */

      it('getSorting Testing', function(){
        var ctrl = controller('TodoCtrl', {
        $scope: scope
        });
        scope.predicateText = "hi";
        scope.predicate = "bye";
        scope.reverse = true;

        scope.setSorting("bye", "hi");
        expect(scope.reverse).toEqual(false);
        expect(scope.predicateText).toEqual("hi");
        expect(scope.predicate).toEqual("bye");

        scope.setSorting("bye", "bye");
        expect(scope.reverse).toEqual(true);

      })

      it('getSorting Testing', function(){
        var ctrl = controller('TodoCtrl', {
        $scope: scope
        });
        scope.predicateText = "hi";
        scope.predicate = "bye";
        scope.reverse = true;

        scope.setSorting("bye", "hi");
        expect(scope.reverse).toEqual(false);
        expect(scope.predicateText).toEqual("hi");
        expect(scope.predicate).toEqual("bye");

        scope.setSorting("bye", "bye");
        expect(scope.reverse).toEqual(true);

      })

      it('addTagToSearch Testing', function(){
        var ctrl = controller('TodoCtrl', {
        $scope: scope
        });
        scope.input = {
          head: " Hello "
        };
        scope.addTagToSearch(1);
        expect(scope.input.head).toEqual("Hello 1");

        scope.input = {
          head: ""
        };
        scope.addTagToSearch(1);
        expect(scope.input.head).toEqual(1);
      })

      it('isNew Testing', function(){
        var ctrl = controller('TodoCtrl', {
        $scope: scope
        });
        var todo = {
          timestamp: new Date().getTime() // now
        }
        expect(scope.isNew(todo)).toEqual(true);
        var todo = {
          timestamp: new Date().getTime() -180001 // < 3min ago
        }
        expect(scope.isNew(todo)).toEqual(false);
      })


    });
  });
