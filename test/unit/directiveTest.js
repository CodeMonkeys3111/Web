'use strict';

describe('Directives tests', function(){
  var compile,
      scope,
      element,
      browser,
      escapeCallback;

  beforeEach(module('todomvc'));

  beforeEach(inject(function($rootScope, $browser, $compile){
    scope=$rootScope.$new();
    browser=$browser;
    compile=$compile;
  }));

  describe('todoEscape test',function(){
    beforeEach(function(){
      escapeCallback = jasmine.createSpy('escapeCallback');
      var el = angular.element('<input todo-escape="escapeCallback">');
      element = compile(el)(scope);
    });

    it('test for escape EscapeKey != 27', function(){
      var testEvent = {type:'keydown',keyCode:312};
      element.triggerHandler(testEvent);
      scope.$digest();
      expect(escapeCallback).not.toHaveBeenCalled();
    });

    it('test for escape EscapeKey = 27', function(){
      var testEvent = {type:'keydown',keyCode:27};
      element.triggerHandler(testEvent);
      scope.$digest();
      expect(escapeCallback).toHaveBeenCalled();
    });
  });

  describe('todoFocus test',function(){
    beforeEach(function(){
      var el = angular.element('<input todo-focus="focus">');
      element = compile(el)(scope);
    });

    it('focus alternating',function(){
      scope.focus=false;
      expect(browser.deferredFns.length).toBe(0);
      scope.$apply(function(){
        scope.focus=true;
      });
      expect(browser.deferredFns.length).toBe(1);
      scope.$apply(function(){
        scope.focus=false;
      });
      expect(browser.deferredFns.length).toBe(1);
    });
  });


});
