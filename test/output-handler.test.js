
YUI.add("test-output-handler", function (Y) {

    var Assert = Y.Assert,
        Handler = require("../lib/output-handler");

    Y.describe("output-handler", function () {
    	Y.it("should be a function", function () {
    		Assert.areSame("function", typeof Handler);
    	});

    	Y.it("should be a object", function () {
    		Assert.areSame("object", typeof new Handler());
    	});

        Y.it("should return a function from send", function () {
            Assert.areSame("function", typeof new Handler().send);
        });
    });

    Y.describe("output-handler function done", function () {

        var res = {
                writeHead: function () {
                    this.cWriteHead = arguments;
                },
                write: function (data) {
                    this.cWrite = data;
                },
                end: function (data) {
                    this.cEnd = data;
                },
                clean: function () {
                    this.cWriteHead = null;
                    this.cWrite = null;
                    this.cEnd = null;
                }
            };

        Y.it("should return a function", function () {
            Assert.areSame(typeof new Handler().done, "function");
        });

        Y.it("should result in the text done", function () {

            var handler,
                req = {},
                next = function (){};

            res.clean();

            handler = new Handler(req, res, next);

            handler.done("done");

            Assert.areSame(200, res.cWriteHead[0]);
            Assert.areSame("done", res.cWrite);
            Assert.areSame(undefined, res.cEnd);
            Assert.areSame(true, handler.headersSent);
        });

        Y.it("should result in the http header text/plain", function () {

            var handler,
                req = {},
                next = function (){};

            res.clean();

            handler = new Handler(req, res, next);

            handler.done("done", {http: {headers: ["text/plain"]}});

            Assert.areSame("text/plain", res.cWriteHead[1]["0"]);
            Assert.areSame("done", res.cWrite);
            Assert.areSame(undefined, res.cEnd);
            Assert.areSame(true, handler.headersSent);
        });

        Y.it("should result in the http header test-test", function () {

            var handler,
                req = {},
                next = function (){};

            res.clean();

            handler = new Handler(req, res, next);

            handler.done("done", {http: {reasonPhrase: "test-test"}});

            Assert.areSame("test-test", res.cWriteHead[1]);
            Assert.areSame("done", res.cWrite);
            Assert.areSame(undefined, res.cEnd);
            Assert.areSame(true, handler.headersSent);
        });

        Y.it("should result in the http header 404", function () {

            var handler,
                req = {},
                next = function (){};

            res.clean();

            handler = new Handler(req, res, next);

            handler.done("done", {http: {code: 404}});

            Assert.areSame(404, res.cWriteHead[0]);
            Assert.areSame("done", res.cWrite);
            Assert.areSame(undefined, res.cEnd);
            Assert.areSame(true, handler.headersSent);
        });

        Y.it("should result in the http header 404 test-test text/plain", function () {

            var handler,
                req = {},
                next = function (){};

            res.clean();

            handler = new Handler(req, res, next);

            handler.done("done", {http: {code: 404, reasonPhrase: "test-test", headers: ["text/plain"]}});

            Assert.areSame(404, res.cWriteHead[0]);
            Assert.areSame("test-test", res.cWriteHead[1]);
            Assert.areSame("text/plain", res.cWriteHead[2]["0"]);
            Assert.areSame("done", res.cWrite);
            Assert.areSame(undefined, res.cEnd);
            Assert.areSame(true, handler.headersSent);
        });
    });

}, "0.0.1", {requires: ["test", "bdd"]});