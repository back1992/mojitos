
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

function getYuiModuleConfigFromFile(fullPath, modules, root) {

    var file,
        ctx,
        name = 'n/a',
        yui = {};

    file = fs.readFileSync(fullPath, "utf8");

    ctx = {
        console: {
            log: function () {}
        },
        window: {},
        document: {},
        YUI: {
            ENV: {},
            config: {},
            use: function () {},
            add: function (name, fn, version, meta) {
                yui.name = name;
                yui.version = version;
                yui.meta = meta || {};
                if (!yui.meta.requires) {
                    yui.meta.requires = [];
                }
                if (yui.meta.requires.length === 0) {
                    yui.meta.requires = undefined;
                }
            }
        }
    };
    try {
        libvm.runInNewContext(file, ctx, fullPath);
    } catch (e) {
        console.log("Not a YUI Module: " + fullPath);
    }
    if (yui && yui.name) {
        modules[yui.name] = modules[yui.name] || {};
        modules[yui.name].fullpath = fullPath; //getRelativePath(fullPath, root);
        modules[yui.name].requires = yui.meta.requires;
        // Mojito metadata used later
        modules[yui.name].mojit = {
            controller: isController(fullPath),
            name: getMojitNameFromPath(fullPath, root),
            root: root
        };
    }
}

/*
    Convert a YUI module config from getYuiModuleConfigFromFile() to a Mojito Mojit map
*/

function getMojitsFromYuiConfig(modules) {
    
    var moduleName,
        yuiModule,
        mojit,
        mojits = {};

    for (moduleName in modules) {

        yuiModule = modules[moduleName];

        if (!mojits[yuiModule.mojit.name]) {
            mojits[yuiModule.mojit.name] = {
                yui: {modules: {}},
                modules: {}
            };
        }

        mojit = mojits[yuiModule.mojit.name];
        
        if (yuiModule.mojit.controller) {
            mojit.controller = moduleName;
        }

        mojit.modules[moduleName] = true;
        mojit.yui.modules[moduleName] = yuiModule;
        delete yuiModule.mojit;
    }

    for (mojit in mojits) {
        mojits[mojit].modules = utils.objKeysToArray(mojits[mojit].modules);
    }

    return mojits;
}

/*
    Walks the user directory and adds a YUI Module for each YUI file found. 
 */

function buildYuiModulesConfig(dir, modules, root) {
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
                getYuiModuleConfigFromFile(absPath, modules[affinity], root);
            } else if (fs.statSync(absPath).isDirectory()) {
                buildYuiModulesConfig(absPath, modules, root);
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
    buildYuiModulesConfig(path.join(__dirname, "mojits"), modules);

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
        buildYuiModulesConfig(mojitDir, modules);
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
        group.definitions = getMojitsFromYuiConfig(modules[affinity]);
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