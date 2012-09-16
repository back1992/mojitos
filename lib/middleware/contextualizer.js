
module.exports = function (app, options) {
	app.use(function (req, res, next) {

		req.context = {
			runtime: "server"
		};

		next();
	});
};