
var OutputHandler = require("../output-handler");

module.exports = function (app, config, requirejs) {

	requirejs(["mojito-dispatch"], function (dispatch) {
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

            //
            outputHandler.dispatch = dispatch;

            // Build the command object here
            dispatch({
                instance: instance, 
                context: req.context,
                params: {
                    route: req.params || {}
                }
            }, outputHandler);
        });
    });
};