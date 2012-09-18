YUI.add("bdd", function (Y) {

	var tests = [];

    Y.describe = function (name, callback) {
    	var testcase = {};
    	testcase.name = name;
    	tests.unshift(testcase);
    	callback();
    	Y.Test.Runner.add(new Y.Test.Case(testcase));
    	tests.shift();
    	return testcase;
    };

    Y.it = function (name, callback) {
    	tests[0][name] = callback;
    };
});

YUI.add("test-output-handler", function (Y) {

    var Assert = Y.Assert,
        handler = require("../lib/output-handler");

    Y.describe("output-handler", function () {
    	Y.it("should be a function", function () {
    		Assert.areSame(typeof handler, "function");
    	});

    	Y.it("should be a object", function () {
    		Assert.areSame(typeof new handler(), "object");
    	});
    });

}, "0.0.1", {requires: ["test", "bdd"]});