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

/*globals define: true*/

"use strict";

define("mojito-addon-cookies", ["mojito-utils"], function (utils) {

    var encode = encodeURIComponent,
        decode = decodeURIComponent;

    /// Serialize the a name value pair into a cookie string suitable for
    /// http headers. An optional options object specified cookie parameters
    ///
    /// serialize('foo', 'bar', { httpOnly: true })
    ///   => "foo=bar; httpOnly"
    ///
    /// @param {String} name
    /// @param {String} val
    /// @param {Object} options
    /// @return {String}
    function serialize(name, val, opt) {

        var pairs = [name + '=' + encode(val)];

        opt = opt || {};

        if (opt.maxAge) {
            pairs.push('Max-Age=' + opt.maxAge);
        }
        if (opt.domain) {
            pairs.push('Domain=' + opt.domain);
        }
        if (opt.path) {
            pairs.push('Path=' + opt.path);
        }
        if (opt.expires) {
            pairs.push('Expires=' + opt.expires.toUTCString());
        }
        if (opt.httpOnly) {
            pairs.push('HttpOnly');
        }
        if (opt.secure) {
            pairs.push('Secure');
        }

        return pairs.join('; ');
    }

    /// Parse the given cookie header string into an object
    /// The object has the various cookies as keys(names) => values
    /// @param {String} str
    /// @return {Object}
    function parse(str) {

        var obj = {},
            pairs = str.split(/[;,] */);

        pairs.forEach(function (pair) {
            var eq_idx = pair.indexOf('='),
                key,
                val;

            eq_idx = eq_idx + 1;

            key = pair.substr(0, eq_idx).trim();
            val = pair.substr(eq_idx, pair.length).trim();

            // quoted values
            if ('"' === val[0]) {
                val = val.slice(1, -1);
            }

            // only assign once
            if (undefined === obj[key]) {
                obj[key] = decode(val);
            }
        });

        return obj;
    }

    return function (command, adapter, api) {

        /**
         * Set cookie `name` to `val`, with the given `options`.
         *
         * Options:
         *
         *    - `maxAge`   max-age in milliseconds, converted to `expires`
         *    - `signed`   sign the cookie
         *    - `path`     defaults to "/"
         *
         * Examples:
         *
         *    // "Remember Me" for 15 minutes
         *    res.cookie('rememberme', '1', { expires: new Date(Date.now() + 900000), httpOnly: true });
         *
         *    // save as above
         *    res.cookie('rememberme', '1', { maxAge: 900000, httpOnly: true })
         *
         * @param {String} name
         * @param {String|Object} val
         * @param {Options} options
         * @api public
         */

        api.cookies.set = function (name, val, options) {
            options = options || {};
            var secret = this.req.secret,
                signed = options.signed;
            if (signed && !secret) {
                throw new Error('connect.cookieParser("secret") required for signed cookies');
            }
            if ('object' === typeof val) {
                val = 'j:' + JSON.stringify(val);
            }
            if (signed) {
                val = 's:' + utils.sign(val, secret);
            }
            if ('maxAge' in options) {
                options.expires = new Date(Date.now() + options.maxAge);
            }
            if (null === options.path) {
                options.path = '/';
            }
            api.http.set('set-cookie', serialize(name, String(val), options));
            return this;
        };

        /*
            When the cookieParser() middleware is used this object defaults to {}, otherwise contains the cookies sent by the user-agent.
        */

        api.cookies.get = function (name) {
            return command.inputs.cookies[name] || {};
        };

        /*
            When the cookieParser(secret) middleware is used this object defaults to {}, 
            otherwise contains the signed cookies sent by the user-agent, unsigned and ready for use. 
            Signed cookies reside in a different object to show developer intent, otherwise a 
            malicious attack could be placed on `req.cookie` values which are easy to spoof. 
            Note that signing a cookie does not mean it is "hidden" nor encrypted, this simply 
            prevents tampering as the secret used to sign is private.
        */

        api.cookies.signed = function (name) {
            return command.inputs.signedCookies[name] || {};
        };

        /*
            Clear cookie `name`.
        */

        api.cookies.clear = function (name, options) {
            var opts = {expires: new Date(1), path: '/'};
            return this.set(name, '', options
                ? utils.merge(opts, options)
                : opts);
        };
    };
});