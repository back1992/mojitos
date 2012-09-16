
var connect = require("connect");

module.exports = function (app, config) {
	app.use(connect.static(config.root));
};