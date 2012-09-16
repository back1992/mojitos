
YUI.add("mojito-core-controller", function (Y, NAME) {

	Y.namespace('mojito.controllers')[NAME] = {

		index: function (ac) {
			ac.done("Mojito is working");
		},

		execute: function (ac) {

			console.log([ac.params.route("type"), ac.params.route("action")]);

			ac.done("x");
		}
    };
}, "", {
	requires: [
		"mojito-addon-params"
	]
});