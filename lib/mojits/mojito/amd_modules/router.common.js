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

/*jslint nomen: true*/

/*globals define: true*/

'use strict';

define("mojito-router", ["mojito-utils"], function (utils) {

    /**
    * Initialize `Route` with the given HTTP `method`, `path`,
    * and an array of `callbacks` and `options`.
    *
    * Options:
    *
    *   - `sensitive`    enable case-sensitive routes
    *   - `strict`       enable strict matching for trailing slashes
    *
    * @param {String} method
    * @param {String} path
    * @param {Array} callbacks
    * @param {Object} options.
    * @api private
    */

    function Route(method, path, callbacks, options) {
        options = options || {};
        this.path = path;
        this.method = method;
        this.callbacks = callbacks;
        this.regexp = utils.pathRegexp(path, this.keys = [], options.sensitive, options.strict);
    }

    /**
     * Check if this route matches `path`, if so
     * populate `.params`.
     *
     * @param {String} path
     * @return {Boolean}
     * @api private
     */

    Route.prototype.match = function (path) {

        var keys = this.keys, params = this.params = [], m = this.regexp.exec(path),
            key,
            val,
            len,
            i;

        if (!m) {
            return false;
        }

        for (i = 1, len = m.length; i < len; i = i + 1) {
            key = keys[i - 1];

            val = 'string' === typeof m[i] ? decodeURIComponent(m[i]) : m[i];

            if (key) {
                params[key.name] = val;
            } else {
                params.push(val);
            }
        }

        return true;
    };

    /**
    * Initialize a new `Router` with the given `options`.
    * 
    * @param {Object} options
    * @api private
    */

    function Router(options) {
        var self = this;
        options = options || {};
        this.map = {};
        this.params = {};
        this._params = [];
        this.caseSensitive = options.caseSensitive;
        this.strict = options.strict;
        this.middleware = function (req, res, next) {
            self._dispatch(req, res, next);
        };
    }

    /**
    * Register a param callback `fn` for the given `name`.
    *
    * @param {String|Function} name
    * @param {Function} fn
    * @return {Router} for chaining
    * @api public
    */

    Router.prototype.param = function (name, fn) {
        // param logic
        if ('function' === typeof name) {
            this._params.push(name);
            return;
        }

        // apply param functions
        var params = this._params,
            len = params.length,
            ret,
            i;

        for (i = 0; i < len; i = i + 1) {
            ret = params[i](name, fn);
            if (ret) {
                fn = ret;
            }
        }

        // ensure we end up with a
        // middleware function
        if ('function' !== typeof fn) {
            throw new Error('invalid param() call for ' + name + ', got ' + fn);
        }

        (this.params[name] = this.params[name] || []).push(fn);

        return this;
    };

    /**
     * Route dispatcher aka the route "middleware".
     *
     * @param {IncomingMessage} req
     * @param {ServerResponse} res
     * @param {Function} next
     * @api private
     */

    Router.prototype._dispatch = function (req, res, next) {

        var params = this.params,
            self = this;

        // console.info('dispatching %s %s (%s)', req.method, req.url, req.originalUrl);

        // route dispatch
        (function pass(i, err) {
            var paramCallbacks,
                paramIndex = 0,
                paramVal,
                route,
                keys,
                key,
                ret;

            // match next route
            function nextRoute(err) {
                pass(req._route_index + 1, err);
            }

            // match route
            req.route = route = self.matchRequest(req, i);

            // no route
            if (!route) {
                return next(err);
            }
            // console.info('matched %s %s', route.method, route.path);

            // we have a route
            // start at param 0
            req.params = route.params;
            keys = route.keys;
            i = 0;

            // param callbacks
            function param(err) {
                paramIndex = 0;
                key = keys[i];
                i = i + 1;
                paramVal = key && req.params[key.name];
                paramCallbacks = key && params[key.name];

                try {
                    if ('route' === err) {
                        nextRoute();
                    } else if (err) {
                        i = 0;
                        callbacks(err);
                    } else if (paramCallbacks && undefined !== paramVal) {
                        paramCallback();
                    } else if (key) {
                        param();
                    } else {
                        i = 0;
                        callbacks();
                    }
                } catch (error) {
                    param(error);
                }
            }

            param(err);

            // single param callbacks
            function paramCallback(err) {
                var fn = paramCallbacks[paramIndex];
                paramIndex = paramIndex + 1;
                if (err || !fn) {
                    return param(err);
                }
                fn(req, res, paramCallback, paramVal, key.name);
            }

            // invoke route callbacks
            function callbacks(err) {
                var fn = route.callbacks[i];
                i = i + 1;
                try {
                    if ('route' === err) {
                        nextRoute();
                    } else if (err && fn) {
                        if (fn.length < 4) {
                            return callbacks(err);
                        }
                        fn(err, req, res, callbacks);
                    } else if (fn) {
                        // fn(req, res, callbacks);
                        /*

                            Ash is here playing with stuff

                        */
                        if (typeof fn === "function") {
                            fn(req, res, callbacks);
                        } else if (typeof fn === "object") {
                            req.mojito = fn;
                            callbacks();
                        }

                    } else {
                        nextRoute(err);
                    }
                } catch (error) {
                    callbacks(error);
                }
            }
        }(0));
    };

    /**
     * Attempt to match a route for `req`
     * with optional starting index of `i`
     * defaulting to 0.
     *
     * @param {IncomingMessage} req
     * @param {Number} i
     * @return {Route}
     * @api private
     */

    Router.prototype.matchRequest = function (req, i, head) {
        var method = req.method.toLowerCase(),
            url = req._parsedUrl,
            path = url.pathname,
            routes = this.map,
            route,
            len;

        i = i || 0;

        // HEAD support
        if (!head && 'head' === method) {
            route = this.matchRequest(req, i, true);
            if (route) {
                return route;
            }
            method = 'get';
        }

        // routes for this method
        routes = routes[method];
        if (routes) {
            // matching routes
            for (len = routes.length; i < len; i = i + 1) {
                route = routes[i];
                if (route.match(path)) {
                    req._route_index = i;
                    return route;
                }
            }
        }
    };

    /**
     * Attempt to match a route for `method`
     * and `url` with optional starting
     * index of `i` defaulting to 0.
     *
     * @param {String} method
     * @param {String} url
     * @param {Number} i
     * @return {Route}
     * @api private
     */

    Router.prototype.match = function (method, url, i, head) {
        var req = {method: method, url: url};
        return this.matchRequest(req, i, head);
    };

    /**
     * Route `method`, `path`, and one or more callbacks.
     *
     * @param {String} method
     * @param {String} path
     * @param {Function} callback...
     * @return {Router} for chaining
     * @api private
     */

    Router.prototype.route = function (method, path, callbacks) {

        var route;

        method = method.toLowerCase();

        callbacks = utils.flatten([].slice.call(arguments, 2));

        // ensure path was given
        if (!path) {
            throw new Error('Router#' + method + '() requires a path');
        }

        // create the route
        // console.info('defined %s %s', method, path);
        route = new Route(method, path, callbacks, {
            sensitive: this.caseSensitive,
            strict: this.strict
        });

        // add it
        (this.map[method] = this.map[method] || []).push(route);
        return this;
    };

    /**
     * Expose `Router` constructor.
     */

    var router = new Router(),
        methods = [
            'get',
            'post',
            'put',
            'head',
            'delete',
            'options',
            'trace',
            'copy',
            'lock',
            'mkcol',
            'move',
            'propfind',
            'proppatch',
            'unlock',
            'report',
            'mkactivity',
            'checkout',
            'merge',
            'm-search',
            'notify',
            'subscribe',
            'unsubscribe',
            'patch'
        ];

    /**
     * Delegate `.VERB(...)` calls to `.route(VERB, ...)`.
     */

    methods.forEach(function (method) {
        router[method] = function (path) {
            if ('get' === method && 1 === arguments.length) {
                return this.set(path);
            }
            var args = [method].concat([].slice.call(arguments));
            // if (!this._usedRouter) this.use(this.router);
            return router.route.apply(router, args);
        };
    });

    /**
     * Special-cased "all" method, applying the given route `path`,
     * middleware, and callback to _every_ HTTP method.
     *
     * @param {String} path
     * @param {Function} ...
     * @return {router} for chaining
     * @api public
     */

    router.all = function (path) {
        var args = arguments;
        methods.forEach(function (method) {
            router[method].apply(this, args);
        }, this);
        return this;
    };

    return router;
});