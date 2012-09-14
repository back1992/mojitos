
module.exports = function (app, options) {
	app.use(function (req, res, next) {
		next();
	});
};