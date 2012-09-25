# Mojitos

[![Build Status](https://secure.travis-ci.org/capecodehq/mojitos.png?branch=master)](http://travis-ci.org/capecodehq/mojitos)

Mojitos is a JavaScript MVC framework for developing runtime agnostic applications. This code is an experimental implementation of the [Yahoo! Mojito](http://developer.yahoo.com/cocktails/mojito/) API.

# Quick Start

Clone the repo and install (requires [nodejs](http://nodejs.org/) and [npm](https://npmjs.org/));

    git clone git://github.com/capecodehq/mojitos.git
    cd ./mojitos
    npm install . -g

In a new directory create the file __./mojits/simple/controller.common.js__ with the following code in it;

    define("simple", {
        index: function(api) {
            api.done("Hello world");
        }
    });

Then in the same directory execute the __start__ command.

    mojito start

Open [http://localhost:3000/@simple/index](http://localhost:3000/@simple/index) in a browser.

<!--
Clone the repo and install (requires [nodejs](http://nodejs.org/) and [npm](https://npmjs.org/));

    git clone git://github.com/capecodehq/mojitos.git
    cd ./mojitos
    npm install .

Start the Mojitos server pointing it at one of the examples;

    ./bin/mojito start -r ./examples/simple/part1

View [http://localhost:3000/@myMojit/index](http://localhost:3000/@myMojit/index) in a browser.

__Note: currently only up to part 1 is implemented__
-->
# The Big Idea

The Mojitos API is designed to abstract away the runtime so you can execute the same code on either the server and/or the client. At the core there are two concepts that provide all Mojitos functionality and both are based around the [AMD Module](https://github.com/amdjs/amdjs-api/wiki/AMD) system.

* Mojits
* Addons

# API Reference

The Mojitos API is a collection of __addons__ that are accessed via the first argument of a controller function. In order to uses __addons__ they must be _required_ using the AMD require system. For example the controller below is requiring addon_a, addon_b and addon_c.

    define("mojit_name", ["addon_a", "addon_b", "addon_c"], {
        index: function(api) {
            // ...
        }
    });

Mojitos attempts to follow the [expressjs](http://expressjs.com/) api where possible to help with developer adoption.

## api

An object __addons__ attach to and the only argument to a controller function. The __api__ has the following functions attached by default along with the [api.http](#apihttp) __addon__.

### api.send

Send data & or meta upstream. Can be called many times.

    api.send("Hello world");
    api.send("Hello world", {http: {code: 200}});

### api.done

Operates the same as [api.send](#apisend) then signals that the current __mojit__ will send no more data or meta. Can only be called once.

    api.done("Hello world");

or;

    api.done("Hello world", {http: {code: 200}});

or;

    api.done();

### api.meta

The __meta__ object is a bag of data that Mojitos or other __mojits__ may inspect. Anything attached to the __meta__ object is passed upstream with the data when either [api.send](#apisend) or [api.done](#apidone) is called. Upstream may mean Mojitos itself or another __mojit__ if you've used a dispatching __addon__ such as [api.composite](#apicomposite).

## api.composite

### api.composite.execute

## api.cookies

An __addon__ for dealing with cookies.

### api.cookies.set

Set cookie name to value, which may be a string or object converted to JSON. The path option defaults to "/".

    api.cookies.set("name", "mojitos", { domain: ".example.com", path: "/admin", secure: true });
    api.cookies.set("rememberme", "1", { expires: new Date(Date.now() + 900000), httpOnly: true });

The maxAge option is a convenience option for setting "expires" relative to the current time in milliseconds. The following is equivalent to the previous example.

    api.cookies.set("rememberme", "1", { maxAge: 900000, httpOnly: true });

An object may be passed which is then serialized as JSON, which is automatically parsed by the bodyParser() middleware.

    api.cookies.set("cart", { items: [1,2,3] });
    api.cookies.set("cart", { items: [1,2,3] }, { maxAge: 900000 });

Signed cookies are also supported through this method. Simply pass the signed option. When given api.cookies.set() will use the secret passed to connect.cookieParser(secret) to sign the value.

    api.cookies.set("name", "mojitos", { signed: true });

Later you may access this value through the [api.cookies.signed](#apicookiessigned) object.

### api.cookies.get

When the cookieParser() middleware is used this object defaults to {}, otherwise contains the cookies sent by the user-agent.

    // Cookie: name=mojitos
    api.cookies.get("name");
    // => "mojitos"

### api.cookies.signed

When the cookieParser(secret) middleware is used this object defaults to {}, otherwise contains the signed cookies sent by the user-agent, unsigned and ready for use. Signed cookies reside in a different object to show developer intent, otherwise a malicious attack could be placed on cookie values which are easy to spoof.

    // Cookie: name=mojitos.CP7AWaXDfAKIRfH49dQzKJx7sKzzSoPq7/AcBBRVwlI3
    api.cookies.signed("name");
    // => "mojitos"

### api.cookies.clear

Clear cookie name. The path option defaults to "/".

    res.cookie('name', 'mojitos', { path: '/admin' });
    res.clearCookie('name', { path: '/admin' });

## api.http

__Server Only:__ An __addon__ for dealing with the HTTP protocol. The __addon__ is safe to use on the client however the functions are a noop.

### api.http.set

Set header field to value, or pass an object to set multiple fields at once.

    api.http.set("Content-Type", "text/plain");

    api.http.set({
        "Content-Type": "text/plain",
        "Content-Length": "123"
    });

### api.http.get

Get the case-insensitive response header field.

    api.http.get("Content-Type");
    // => "text/plain"

### api.http.charset

Assign the charset. Defaults to "utf-8".

    api.http.charset("value");
    api.done("some html");
    // => charset: value

### api.http.type

Sets the Content-Type to the mime lookup of type, or when "/" is present the Content-Type is simply set to this literal value.

    api.http.type('.html');
    api.http.type('html');
    api.http.type('json');
    api.http.type('application/json');
    api.http.type('png');

### api.http.status

Chainable alias of node's `res.statusCode=`.

    res.status(404).done("Not found.");

### api.http.links

Join the given links to populate the "Link" response header field.

    res.links({
        next: "http://api.example.com/users?page=2",
        last: "http://api.example.com/users?page=5"
    });

yields:

    Link: <http://api.example.com/users?page=2>; rel="next", 
          <http://api.example.com/users?page=5>; rel="last"

## api.params

### api.params.get

### api.params.route

### api.params.query

### api.params.body

### api.params.files

## api.render

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
* tmpls (tbd)
* confs (tbd)

A __mojit__ folder can contain any number of sub folders allowing for the organization of files. All files must be AMD Modules and follow the pattern defined above. The only exception to this rule is the following folder;

* assets

The assets folder can contain any number of files and folders of any file type and content. The files placed in this folder are accessible publicly via a URI e.g. "http://localhost:3000/mojit_name/assets/other_file.css".

### controller

The key concept Mojitos uses to serve pages is what it calls a controller. A controller has a one-to-one mapping to a URI. For example the URI "http://localhost:3000/@mojito_name/index" would execute the function "index" in the AMD module below (assuming the module file was found at _./mojits/mojit_name/controller.common.js_).

    define("mojit_name", {
        index: function(api) {
            api.done("Hello world");
        }
    });

## Addon

An __addon__ a is way of attaching reusable functionality to a __mojit__ functions __api__ object.

    define("mojito-addon-name", function () {
        function Addon(command, adapter, api) {
            // ...
        }
        return function (command, adapter, api) {
            api.addon = new Addon(command, adapter, api);
        };
    });