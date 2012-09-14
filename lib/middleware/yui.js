
var connect = require("connect"),
	path = require("path");

module.exports = function (app, options) {
	app.use("/yui/", connect.static(path.join(__dirname, "/../../", "node_modules/yui")));
};