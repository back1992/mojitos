# Mojitos

[![Build Status](https://secure.travis-ci.org/capecodehq/mojitos.png?branch=master)](http://travis-ci.org/capecodehq/mojitos)

Mojitos is a JavaScript MVC framework for developing runtime agnostic applications. This code is an experimental implementation of the [Yahoo! Mojito](http://developer.yahoo.com/cocktails/mojito/) API.

# Quick Start

Clone the repo and install (requires [nodejs](http://nodejs.org/) and [npm](https://npmjs.org/));

    git clone git://github.com/capecodehq/mojitos.git
    cd ./mojitos
    npm install .

Start the Mojitos server pointing it at one of the examples;

    ./bin/mojito start -r ./examples/simple/part1

View [http://localhost:3000/](http://localhost:3000/@myMojit/index) in a browser.

__Note: currently only up to part 1 is implemented__

# The API

The Mojitos API is based around the [AMD Module](https://github.com/amdjs/amdjs-api/wiki/AMD) system. At the core there are two concepts that provide Mojitos functionality.

* Mojits
* Addons

## Mojit

A Mojit is a collection of AMD Modules. Mojits use folders in predefined locations to group ".js" files and infer relationships between them.

    mojits/
        mojit_name/
            controller.common.js
            assets/
            	other_files.css
            	not_amd_file.js
            folder/
                other_amd_file.common.js

The ".js" files have a special naming convention "[name].[affinity].js". The _affinity_ is used to decide where the code can be executed. Currently this can be one of three values;

* client
* common
* server

The _name_ can be any anything however there are several reserved filenames which have special meaning;

* controller

A __mojit__ folder can contain any number of sub folders allowing for arbitrary organization of files. All files must be AMD Modules and follow the pattern defined above. The only exception to this rule is the following folder;

* assets

The assets folder can contain any number of files and folders of any file type. The files placed in this folder are accessible publicly via a URI e.g. "http://localhost:3000/mojit_name/assets/other_file.css".

### controller

    define("mojit_name", {
        index: function(api) {
            api.done("Hello world");
        }
    });

## Addon

An __addon__ a is simple way of providing functionality to a __mojit__ functions __api__ object.

    define("mojito-addon-name", function () {
        function Addon(command, adapter, api) {
            // ...
        }
        return function (command, adapter, api) {
            api.addon = new Addon(command, adapter, api);
        };
    });
