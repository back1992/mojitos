
var YUI = require('yui').YUI,
	OutputHandler = require("../output-handler");

module.exports = function (app, options) {

	var Y = YUI(options.yui).use("mojito-dispatch");

	app.use(function (req, res, next) {

		var command = req.command,
            outputHandler;

        if (!command) {
            next();
            return;
        }

        outputHandler = new OutputHandler(req, res, next);

        Y.mojito.dispatch(command, outputHandler);
	});
};