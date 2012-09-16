/*jslint nomen: true*/

'use strict';

var program = require("commander"),
    path = require("path"),
    connect = require("connect"),
    utils = require("../utils"),
    mdc = require("mdc"),
    querystring = require("querystring"),
    YUI = require('yui').YUI,
    ResourceStore = require("../resource-store");

program
    .command(path.basename(__filename, ".js"))
    .option("-r, --root [dir]", "which directory to run from", process.cwd())
    .option("-p, --port [port]", "which port to use", null)
    .option("-c, --context [context]", "which context to start the sever with", {})
    .description('start a local server')
    .action(function (options) {

        var resourceStore,
            middleware,
            appConfig,
            config,
            app = connect(),
            i,
            Y; // The YUI instance we use to populate the store

        if (options.root[0] = ".") {
            options.root = path.join(process.cwd(), options.root);
        }

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
            The most important part of the startup is loading the ResourceStore.
        */
        resourceStore = new ResourceStore(options);
        config = resourceStore.get(null, options.context);

        /*
            Attach the "resourceStore" to the the Y.mojito.store
        */
        YUI.applyConfig(config.yui);
        Y = YUI(config.definitions.core.yui).use("mojito-store");
        Y.mojito.store.source = resourceStore;

        /*
            Mojito is the only entity that adds middleware so this part is not extendable
        */
        for (i = 0; i < config.middleware.length; i = i + 1) {
            middleware = config.middleware[i];
            require(path.join(__dirname, "/../middleware", middleware))(app, config, Y);
        }

        /*
            Listen on the port we are given
        */
        app.listen(config.port);

        /*
            Tell the user were we are running
        */
        console.log("Running on http://localhost:" + config.port + "/");

        // console.log(JSON.stringify(config, null, 4));
    });

// program.parse(process.argv);