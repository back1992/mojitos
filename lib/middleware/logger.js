
var connect = require("connect");

module.exports = function (app) {
	app.use(connect.logger("dev"));
};