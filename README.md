# Mojitos

Mojitos is a JavaScript MVC framework for developing runtime agnostic applications. This code is an experimental implementation of the [Yahoo! Mojito](http://developer.yahoo.com/cocktails/mojito/) API.

# Quick Start

Clone the repo and install (requires [nodejs](http://nodejs.org/) and [npm](https://npmjs.org/));

    git clone git://github.com/capecodehq/mojitos.git
    cd ./mojitos
    npm install .

Start the Mojitos server pointing at one of the examples;

    ./bin/mojito start -r ./examples/simple/part1

View [http://localhost:3000/](http://localhost:3000/@myMojit/index) in a browser.

# The API

The Mojitos API is based around the YUI module system.

## Mojit

A Mojit is a collection of YUI modules. Mojits use folders in predefined locations to group ".js" files and infer relationships between them.

    mojits/
        mojit_name/
            controller.common.js
            tmpls.common.js
            confs.common.js
            folder/
                other_yui_module.common.js

The ".js" files have a special naming convention "[name].[affinity].js". The _affinity_ is used to decide where the code can be executed. Currently this can be one of three values;

* client
* common
* server

The _name_ can be any anything however there are several reserved filenames which have special meaning;

* controller
* tmpls
* confs

### controller

    YUI.add("mojit_name", function(Y, NAME) {
        Y.namespace("mojito.controllers")[NAME] = {
            index: function(api) {
                api.done("Hello world");
            }
        };
    });

### tmpls (not implemented yet)

    YUI.add("mojit-name-tmpls", function (Y, NAME) {
        Y.namespace("mojito")[NAME] = {
            index: {
                engine: "yui-module-name",
                tmpl: "<p>{{key}}</p>"
            }
        };
    });

### confs (not implemented yet)

    YUI.add("mojit-name-confs", function (Y, NAME) {
        Y.namespace("mojito")[NAME] = {
            name: {
                key: "val"
            }
        };
    });

## Addon

    YUI.add("mojito-addon-name", function (Y) {
        function Addon(command, adapter, api) {
            // ...
        }
        Y.namespace("mojito.addons").name = Addon;
    });
