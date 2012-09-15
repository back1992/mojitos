
var YUI = require('yui').YUI;

module.exports = function (app, config) {

	var Y = YUI(config.yui).use("mojito-router");

	Y.mojito.router.all("/", {
		type: "default",
		action: "index"
	});

	app.use(Y.mojito.router.middleware);
};