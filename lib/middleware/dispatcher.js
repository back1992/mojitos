
var OutputHandler = require("../output-handler");

module.exports = function (app, config, Y) {

	Y.use("mojito-dispatch");

	app.use(function (req, res, next) {

		var instance = req.mojito,
            outputHandler;

        if (!instance) {
            next();
            return;
        }

        outputHandler = new OutputHandler(req, res, next);

        Y.mojito.dispatch({
            instance: instance, 
            context: req.context
        }, outputHandler);
	});
};