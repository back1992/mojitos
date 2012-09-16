
var OutputHandler = require("../output-handler");

module.exports = function (app, config, Y) {

	Y.use("mojito-dispatch");

	app.use(function (req, res, next) {

		var instance = req.mojito,
            outputHandler;

        // If there was no "mojito" key on the request call next()
        if (!instance) {
            next();
            return;
        }

        // Create a new OutputHandler for the request
        outputHandler = new OutputHandler(req, res, next);

        // Build the command object here
        Y.mojito.dispatch({
            instance: instance, 
            context: req.context
        }, outputHandler);
	});
};