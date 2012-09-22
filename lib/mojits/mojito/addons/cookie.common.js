
define("mojito-addon-cookies", ["mojito-utils"], function (utils) {

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
			var secret = this.req.secret;
			var signed = options.signed;
			if (signed && !secret) throw new Error('connect.cookieParser("secret") required for signed cookies');
			if ('object' == typeof val) val = 'j:' + JSON.stringify(val);
			if (signed) val = 's:' + utils.sign(val, secret);
			if ('maxAge' in options) options.expires = new Date(Date.now() + options.maxAge);
			if (null == options.path) options.path = '/';
			api.http.set('set-cookie', cookie.serialize(name, String(val), options));
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

		api.cookies.clear = function (name, options){
			var opts = { expires: new Date(1), path: '/' };
			return this.set(name, '', options
				? utils.merge(opts, options)
				: opts);
		};
	};
});