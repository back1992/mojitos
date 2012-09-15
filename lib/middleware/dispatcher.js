
var YUI = require('yui').YUI,
	OutputHandler = require("../output-handler");

module.exports = function (app, config) {

	var Y = YUI(config.yui).use("mojito-dispatch");

	app.use(function (req, res, next) {

		var command = req.mojito,
            outputHandler;

        if (!command) {
            next();
            return;
        }

        outputHandler = new OutputHandler(req, res, next);

        Y.mojito.dispatch(command, outputHandler);
	});
};