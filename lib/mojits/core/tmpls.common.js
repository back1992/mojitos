
YUI.add("core-tmpls", function (Y, NAME) {
	Y.namespace("mojito")[NAME] = {
		index: {
            engine: "handlebars",
            tmpl: "<p>{{key}}</p>"
        }
	};
});