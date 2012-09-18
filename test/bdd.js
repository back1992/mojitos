YUI.add("bdd", function (Y) {

	var tests = [];

	Y.before = function (fn) {
		tests[0].setUp = fn;
	}

	Y.after = function (fn) {
		tests[0].tearDown = fn;
	}

    Y.describe = function (name, fn) {
    	var testcase = {};
    	testcase.name = name;
    	tests.unshift(testcase);
    	fn();
    	Y.Test.Runner.add(new Y.Test.Case(testcase));
    	tests.shift();
    	return testcase;
    };

    Y.it = function (name, fn) {
    	if (tests[0][name]) {
    		Y.log("Skipping it '" + name + "' as it has already been added.");
    	} else {
    		tests[0][name] = fn;
    	}
    };
});