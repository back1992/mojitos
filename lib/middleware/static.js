
var connect = require("connect");

module.exports = function (app, options) {
	app.use(connect.static(options.root));
};