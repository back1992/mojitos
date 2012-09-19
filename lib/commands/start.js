/*jslint nomen: true*/

'use strict';

var program = require("commander"),
    path = require("path"),
    fs = require("fs"),
    connect = require("connect"),
    utils = require("../utils"),
    mdc = require("mdc"),
    querystring = require("querystring"),
    // YUI = require('yui').YUI,
    requirejs = require("requirejs"),
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
            // Y, // The YUI instance we use to populate the store
            name,
            modules,
            fullpath,
            yuiModuleName; 

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
        // We make a copy to keep the source data clean and light.
        config = utils.copy(resourceStore.get(null, options.context));

        /*
            Attach the "resourceStore" to the the Y.mojito.store
        */
        // YUI.applyConfig(config.yui);
        // Y = YUI(config.definitions.core.yui).use("mojito-store");
        // Y.mojito.store.source = resourceStore;

        /*
            Configure RequireJS for use on the server
        */
        requirejs.config({
            baseUrl: config.root,
            nodeRequire: require,
            paths: config.definitions.core.amd.modules
        });

        /*
            Enter into the world of AMD
        */
        requirejs(["mojito-store"], function (store) {

            store.source = resourceStore;

            /*
                Mojito is the only entity that adds middleware so this part is not extendable
            */
            for (i = 0; i < config.middleware.length; i = i + 1) {
                middleware = config.middleware[i];
                require(path.join(__dirname, "/../middleware", middleware))(app, config, requirejs);
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
        // }, function (nobend) {
        //     console.log(nobend);
        });

        // Load init modules. This is skipped if it is not found.
        // for (name in config.initModules) {

        //     modules = {};
        //     fullpath = config.initModules[name];
        //     yuiModuleName = path.basename(fullpath, ".js");

        //     if (fullpath[0] === ".") {
        //         fullpath = path.join(config.root, fullpath);
        //     }

        //     try {
        //         // Check if the file is exists
        //         fs.readFileSync(fullpath);
        //     } catch (err) {
        //         // Y.log(err);
        //         fullpath = null;
        //     }

        //     // If we have a fullpath add to the YUI config
        //     if (fullpath) {
        //         modules[yuiModuleName] = {
        //             fullpath: fullpath
        //         };
        //         Y.applyConfig({modules: modules});
        //         // Then YUI().use("it");
        //         Y.use(yuiModuleName);
        //         // Log that we loaded the file
        //         Y.log("Loaded initializer module: " + fullpath, "info");
        //     }
        // }
    });

// program.parse(process.argv);