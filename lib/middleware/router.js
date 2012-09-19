
var path = require("path"),
	fs = require("fs");

module.exports = function (app, config, requirejs) {

	var name,
		route,
		verb;

	requirejs(["mojito-router"], function (router) {

		// Load all routes found in the config
		for (name in config.routes) {
			route = config.routes[name];

			for (verb in route.verbs) {
				router[route.verbs[verb]](route.path, route.call);
			}
		}

		router.get("/@:type/:action", function (req, res, next) {
			req.mojito = {
				type: req.params.type,
				action: req.params.action
			};
			next();
		});

		app.use(router.middleware);
	});
};