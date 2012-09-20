// (The MIT License)

// Copyright (c) 2012 Richard S Allinson <rsa@mountainmansoftware.com>

// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// 'Software'), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

/*jslint stupid: true, nomen: true*/

'use strict';

var program = require("commander"),
    path = require("path"),
    fs = require("fs"),
    connect = require("connect"),
    utils = require("../utils"),
    querystring = require("querystring"),
    requirejs = require("requirejs"),
    ResourceStore = require("../resource-store");

/*
    This function loads any AMD modules listed in application.json
*/

function loadInit(app, config, requirejs) {

    var name,
        fullpath,
        moduleName;

    for (name in config.initModules) {
        if (config.initModules.hasOwnProperty(name)) {
            /*
                Grab the paths from the main config
            */
            fullpath = config.initModules[name];
            moduleName = path.basename(fullpath, ".js");

            /*
                Expand the path if is is relative
            */
            if (fullpath[0] === ".") {
                fullpath = path.join(config.root, fullpath);
            }

            try {
                /*
                    Check if the file is exists
                */
                fs.readFileSync(fullpath);
            } catch (err) {
                fullpath = null;
            }

            /*
                If we have a fullpath add to the YUI config
            */
            if (fullpath) {
                requirejs([fullpath], function () {
                    console.log("Loaded initializer module: " + fullpath, "info");
                });
            }
        }
    }
}

/*
    The main start command for Mojito
*/

program
    .command(path.basename(__filename, ".js"))
    .option("-r, --root [dir]", "which directory to run from", process.cwd())
    .option("-p, --port [port]", "which port to use", null)
    .option("-c, --context [context]", "which context to start the sever with", {})
    .description('start a local server')
    .action(function (options) {

        var resourceStore,
            middleware,
            config,
            app,
            i;

        /*
            Expand the root path if is is relative
        */
        if (options.root[0] === ".") {
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

        /*
            We make a copy to keep the source data clean and light.
        */
        config = utils.copy(resourceStore.get(null, options.context));

        /*
            Configure RequireJS for use on the server
        */
        requirejs.config({
            baseUrl: config.root,
            nodeRequire: require,
            paths: config.definitions.mojito.amd.modules
        });

        /*
            Enter into the world of AMD
        */
        requirejs(["mojito-store"], function (store) {

            /*
                Attach the "resourceStore" to the the mojito-store object
            */
            store.source = resourceStore;

            /*
                Create the connect app
            */
            app = connect();

            /*
                Load init modules. This is skipped if it is not found.
            */
            loadInit(app, config, requirejs);

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
        });
    });

// program.parse(process.argv);