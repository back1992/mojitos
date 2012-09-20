
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
    return "." + fullPath.slice(root.length);
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
        modules[amd.name] = modules[amd.name] || {};
        modules[amd.name].fullpath = fullpath;
        modules[amd.name].mojit = {
            name: getMojitNameFromPath(fullpath, root),
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

        amdModule = modules[moduleName];

        if (!mojits[amdModule.mojit.name]) {
            mojits[amdModule.mojit.name] = {
                amd: {modules: {}},
                modules: {}
            };
        }

        mojit = mojits[amdModule.mojit.name];
        
        if (amdModule.mojit.controller) {
            mojit.controller = moduleName;
        }

        // Copy all the required modules into a map to remove dupes
        for (reqModuleName in amdModule.mojit.requires) {
            mojit.modules[amdModule.mojit.requires[reqModuleName]] = true;
        }

        mojit.amd.modules[moduleName] = amdModule.fullpath.slice(0, -3);
        mojit.modules = utils.objKeysToArray(mojit.amd.modules);
        mojit.modules = mojit.modules.concat(amdModule.mojit.requires);
        mojit.modules.unshift(mojit.controller); // the controller must be first in the list
        mojit.modules = utils.unique(mojit.modules);
        delete amdModule.mojit;
    }

    return mojits;
}

/*
    Walks the user directory and adds a YUI Module for each YUI file found. 
 */

function buildModulesConfig(dir, modules, root) {
    var files,
        name,
        absPath;

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
        this.dimensions = utils.readConfigSync(path.join(__dirname, "dimensions"))
    }

    this.load();
}

/*

*/

ResourceStore.prototype.load = function() {

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

    // First we'll get all YUI files in the Mojito mojits directory seperated by affinity
    buildModulesConfig(path.join(__dirname, "mojits"), modules);

    // Before we build the final appConfig we need one to see where to looks for mojits
    tmpAppConfig = mdc.create(this.dimensions, appConfig).get(null, {runtime: "server"});
    mojitsDirs = tmpAppConfig.mojitsDirs;

    // Then we will look in each mojit dir defined in the app config
    for (dir in mojitsDirs) {
        mojitDir = mojitsDirs[dir];
        if (mojitDir[0] === ".") {
            mojitDir = path.join(this.appRoot, mojitDir);
        }
        // Get all YUI files in the Mojito mojits directory seperated by affinity
        buildModulesConfig(mojitDir, modules);
    }

    // Get any routes files that are defined in the config
    for (routesFile in tmpAppConfig.routesFiles) {
        routes = tmpAppConfig.routesFiles[routesFile];
        if (routes[0] === ".") {
            routes = path.join(this.appRoot, routes);
        }
        routes = utils.readConfigSync(routes) || [];
        // TODO: Add the routes to the appConfig
    }

    // Add each affinity to the "appConfig" array
    for (affinity in modules) {

        group = {};
        group.definitions = getMojitsFromModuleConfig(modules[affinity]);
        group.settings = ["runtime:" + affinity];

        appConfig.push(group);
    }

    // console.log(JSON.stringify(appConfig, null, 4));

    // Load the "appConfig" into the mdc
    this.mdc = mdc.create(this.dimensions, appConfig);

    // Then set the app root & port for other to use
    this.mdc.set({
        root: this.appRoot || undefined,
        port: this.appPort || undefined
    }, {
        runtime: "server"
    });
};

/*
    The only way to get data out of the ResourceStore
*/

ResourceStore.prototype.get = function(key, context) {
    return this.mdc.get(key, context);
};

/*
    Expose the ResourceStore
*/

module.exports = ResourceStore;