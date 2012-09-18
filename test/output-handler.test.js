YUI.add('test-output-handler', function (Y) {
    var Assert = Y.Assert,
        handler = require('../lib/output-handler');

    var describe,
    	it,
    	testcase = {};

    describe = function (name, callback) {
    	testcase.name = name;
    	callback();
    	Y.Test.Runner.add(new Y.Test.Case(testcase));
    };

    it = function (name, callback) {
    	testcase[name] = callback;
    };

    describe("output-handler", function () {
    	it("should be a function", function () {
    		Assert.areSame(typeof handler, "function");
    	});

    	it("should be a object", function () {
    		Assert.areSame(typeof new handler(), "object");
    	});
    });

}, '0.0.1', {requires: [ 'test']});