
YUI.add("mojito-core-controller", function (Y, NAME) {

	Y.namespace('mojito.controllers')[NAME] = {

		index: function (ac) {
			ac.done("Mojito is working");
		},

		execute: function (ac) {

			var cfg = {
					main: {
						type: ac.params.route("type"),
						action: ac.params.route("action")
					}
				};

			ac.composite.execute(cfg, function (data, meta) {
				ac.done("x");
			});
		}
    };
}, "", {
	requires: [
		"mojito-addon-params",
		"mojito-addon-composite"
	]
});