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

var fs = require("fs"),
    path = require("path"),
    libvm = require("vm"),
    mdc = require("mdc"),
    utils = require("./utils");

/*
    Returns the affinity or throws an error.
 */

function getFileAffinity(fullPath) {
    return fullPath.split(".").slice(-2)[0];
}

/*
    Returns true if the path is a controller
 */

function isController(fullPath) {
    return fullPath.split("/").slice(-1)[0].split(".")[0] === "controller";
}

/*
    Returns the name of the mojit the path is in.
 */

function getMojitNameFromPath(fullPath, root) {
    // Look for package.json here before using the dir name
    return fullPath.slice(root.length).split("/")[1];
}

/*
    Returns a relative path to the web app root from an absolute path.
 */

function getRelativePath(fullPath, root) {
    return fullPath.slice(root.length);
}

/*
    Reads a YUI Module file and extracts the "name", "version" and "requires" values.
    Updates the provided "modules" object with a YUI Config for the parsed module.
 */

function getModuleConfigFromFile(fullpath, modules, root) {

    var file,
        ctx,
        name = 'n/a',
        amd = {};
        // yui = {};

    file = fs.readFileSync(fullpath, "utf8");

    ctx = {
        console: {
            log: function () {}
        },
        window: {},
        document: {},
        define: function (name, requires, fn) {
            if (fn === undefined) {
                fn = requires;
                requires = [];
            }
            amd.name = name;
            amd.requires = requires;
        }
    };

    try {
        libvm.runInNewContext(file, ctx, fullpath);
    } catch (e) {
        console.log(e);
        console.log("Not an AMD Module: " + fullpath);
    }

    if (amd && amd.name) {
        modules[amd.name] = {
            name: getMojitNameFromPath(fullpath, root),
            fullpath: fullpath,
            relpath: getRelativePath(fullpath, root),
            controller: isController(fullpath),
            requires: amd.requires,
            root: root
        };
    }
}

/*
    Convert a YUI module config from getYuiModuleConfigFromFile() to a Mojito Mojit map
*/

function getMojitsFromModuleConfig(modules) {

    var moduleName,
        reqModuleName,
        amdModule,
        mojit,
        mojits = {};

    for (moduleName in modules) {
        if (modules.hasOwnProperty(moduleName)) {
            amdModule = modules[moduleName];

            if (!mojits[amdModule.name]) {
                mojits[amdModule.name] = {
                    amd: {server: {}, client: {}},
                    assets: {}
                };
            }
            mojit = mojits[amdModule.name];

            // Add the fullpath to this module in the AMD config
            mojit.amd.server[moduleName] = amdModule.fullpath.slice(0, -3);
            // Add the relpath to this module in the AMD config
            mojit.amd.client[moduleName] = amdModule.relpath.slice(0, -3);
            // If this is a controller store it
            if (amdModule.controller) {
                mojit.controller = moduleName;
                mojit.requires = amdModule.requires;
            }
            // Map
            mojit.assets[amdModule.relpath] = amdModule.fullpath;
        }
    }

    return mojits;
}

/*
    Walks the user directory and adds a YUI Module for each YUI file found. 
 */

function getAssetsFromModuleDefinitions(modules) {

    var assets = {},
        moduleName,
        amdModule,
        asset;

    for (moduleName in modules) {
        if (modules.hasOwnProperty(moduleName)) {
            amdModule = modules[moduleName];

            for (asset in amdModule.assets) {
                if (amdModule.assets.hasOwnProperty(asset)) {
                    assets[asset] = amdModule.assets[asset];
                }
            }
        }
    }

    return assets;
}

/*
    Walks the user directory and adds a YUI Module for each YUI file found. 
 */

function buildModulesConfig(dir, modules, root) {

    var files,
        name,
        absPath,
        affinity;

    if (!modules) {
        modules = {};
    }

    if (!root) {
        root = dir;
    }

    try {
        files = fs.readdirSync(dir);
    } catch (err) {
        return modules;
    }

    for (name in files) {
        if (files.hasOwnProperty(name)) {
            absPath = path.join(dir, files[name]);
            if (/\.js$/.test(absPath)) {
                affinity = getFileAffinity(absPath);
                if (!modules[affinity]) {
                    modules[affinity] = {};
                }
                getModuleConfigFromFile(absPath, modules[affinity], root);
            } else if (fs.statSync(absPath).isDirectory()) {
                buildModulesConfig(absPath, modules, root);
            }
        }
    }

    return modules;
}

/*

*/

function ResourceStore(options) {
    this.mdc = null;
    this.appRoot = options.root;
    this.appPort = options.port;
    this.dimensions = utils.readConfigSync(path.join(this.appRoot, "dimensions"));

    // If the application has no dimensions file then use the default one
    if (!this.dimensions) {
        this.dimensions = utils.readConfigSync(path.join(__dirname, "dimensions"));
    }

    this.load();
}

/*

*/

ResourceStore.prototype.load = function () {

    var modules = {},
        appConfig,
        tmpAppConfig,
        affinity,
        moduleName,
        mojitsDirs,
        mojitDir,
        group,
        routesFile,
        routes,
        dir;

    // Tell the world what we are doing
    console.log("Loading: " + this.appRoot);

    // Load the "default" application config then the "applications" application config
    appConfig = utils.readConfigSync(path.join(__dirname, "application"));
    appConfig = appConfig.concat(utils.readConfigSync(path.join(this.appRoot, "application")) || []);

    // First we'll get all AMD files in the Mojito mojits directory seperated by affinity
    buildModulesConfig(path.join(__dirname, "mojits"), modules);

    // Before we build the final appConfig we need one to see where to looks for mojits
    tmpAppConfig = mdc.create(this.dimensions, appConfig).get(null, {runtime: "server"});
    mojitsDirs = tmpAppConfig.mojitsDirs;

    // Then we will look in each mojit dir defined in the app config
    for (dir in mojitsDirs) {
        if (mojitsDirs.hasOwnProperty(dir)) {
            mojitDir = mojitsDirs[dir];
            if (mojitDir[0] === ".") {
                mojitDir = path.join(this.appRoot, mojitDir);
            }
            // Get all YUI files in the Mojito mojits directory seperated by affinity
            buildModulesConfig(mojitDir, modules);
        }
    }

    // Get any routes files that are defined in the config
    for (routesFile in tmpAppConfig.routesFiles) {
        if (tmpAppConfig.routesFiles.hasOwnProperty(routesFile)) {
            routes = tmpAppConfig.routesFiles[routesFile];
            if (routes[0] === ".") {
                routes = path.join(this.appRoot, routes);
            }
            routes = utils.readConfigSync(routes) || [];
            // TODO: Add the routes to the appConfig
        }
    }

    // Add each affinity to the "appConfig" array
    for (affinity in modules) {
        if (modules.hasOwnProperty(affinity)) {

            group = {};
            group.definitions = getMojitsFromModuleConfig(modules[affinity]);
            group.assets = getAssetsFromModuleDefinitions(group.definitions);
            group.settings = ["runtime:" + affinity];

            appConfig.push(group);
        }
    }

    // console.log(JSON.stringify(appConfig, null, 4));

    // Load the "appConfig" into the mdc
    this.mdc = mdc.create(this.dimensions, appConfig);

    // Then set the app root & port for others to use
    this.mdc.set({
        root: this.appRoot || undefined,
        port: this.appPort || undefined
    }, {
        runtime: "server"
    });

    // console.log(JSON.stringify(this.mdc.get(null, {runtime: "server"}), null, 4));
};

/*
    The only way to get data out of the ResourceStore
*/

ResourceStore.prototype.get = function (key, context) {
    return this.mdc.get(key, context);
};

/*
    Expose the ResourceStore
*/

module.exports = ResourceStore;