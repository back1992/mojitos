
module.exports = function (app, config, Y) {

	Y.use("mojito-router", "mojito-store");

	Y.mojito.router.all("*", {
		type: "core",
		action: "404"
	});

	app.use(Y.mojito.router.middleware);
};