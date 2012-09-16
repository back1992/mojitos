
module.exports = function (app) {
	app.use(function (req, res, next) {

		req.context = {
			runtime: "server"
		};

		next();
	});
};