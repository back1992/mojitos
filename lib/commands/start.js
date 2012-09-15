/*jslint nomen: true*/

'use strict';

var program = require("commander"),
    path = require("path"),
    connect = require("connect"),
    utils = require("../utils"),
    mdc = require("mdc"),
    querystring = require("querystring");

program
    .command(path.basename(__filename, ".js"))
    .option("-r, --root [dir]", "which directory to run from", process.cwd())
    .option("-p, --port [port]", "which port to use", null)
    .option("-c, --context [context]", "which context to start the sever with", {})
    .description('start a local server')
    .action(function (options) {

        /*
            Grab the configs and get ready to run
        */
        var dimensions = utils.readConfigSync(path.join(options.root, "dimensions")),
            mojitoConfig = utils.readConfigSync(path.join(__dirname, "/../application")),
            appConfigRaw = utils.readConfigSync(path.join(options.root, "application")) || {},
            middleware,
            appConfig,
            config,
            app = connect(),
            i;

        /*
            Convert the sring context into an object
        */
        options.context = querystring.parse(options.context);

        /*
            If the runtime is not set in the context make it "server"
        */
        if (!options.context.runtime) {
            options.context.runtime = "server";
        }

        /*
            If the application has no dimensions file then use the default one
        */
        if (!dimensions) {
            dimensions = utils.readConfigSync(path.join(__dirname, "/../dimensions"))
        }

        /*
            Read the application configuration with the given context
        */
        appConfig = mdc.create(dimensions, appConfigRaw).get(null, options.context);

        /*
            Merge the contextulized application configuration over the default mojito one
        */
        config = utils.mergeRecursive(appConfig, mojitoConfig);

        /*
            Convert YUI relative paths absolute paths
        */
        var mod, cur;
        for (mod in config.yui.modules) {
            cur = config.yui.modules[mod];
            if (cur.fullpath[0] === '.') {
                cur.fullpath = path.join(__dirname, "/../", cur.fullpath);
            }
        }

        /*
            Set the root directory and port of the application
        */
        config.root = options.root;
        config.port = options.port || config.port;

        // console.log(options.context);
        // console.log(JSON.stringify(dimensions, null, 4));
        // console.log(config);

        /*
            Mojito is the only entity that adds middleware so this part is not extendable
        */
        for (i = 0; i < mojitoConfig.middleware.length; i = i + 1) {
            middleware = mojitoConfig.middleware[i];
            require(path.join(__dirname, "/../middleware", middleware))(app, config);
        }

        /*
            Listen on the port we are given
        */
        app.listen(config.port);

        /*
            Tell the user were we are running
        */
        console.log("Running on http://localhost:" + config.port + "/");
    });

// program.parse(process.argv);