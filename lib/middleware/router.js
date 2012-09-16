
module.exports = function (app, config, Y) {

	var name,
		route,
		verb;

	Y.use("mojito-router");

	// Load all routes found in the config
	for (name in config.routes) {
		route = config.routes[name];

		for (verb in route.verbs) {
			Y.mojito.router[route.verbs[verb]](route.path, route.call);
		}
	}

	Y.mojito.router.get("/@:type/:action", {
		type: "core",
		action: "execute"
	});

	app.use(Y.mojito.router.middleware);
};