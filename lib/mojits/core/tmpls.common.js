
YUI.add("core-confs", function (Y, NAME) {
	Y.namespace("mojito")[NAME] = {
		index: {
            engine: "hb",
            tmpl: "<h1>{{key}}</h1>"
        }
	};
});