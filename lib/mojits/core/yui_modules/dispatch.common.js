
YUI.add("mojito-dispatch", function (Y) {

	Y.namespace("mojito").dispatch = function (command, adapter) {
		adapter.done("Hello world!");
	};

});