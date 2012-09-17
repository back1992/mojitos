
YUI.add("init", function(Y) {

    Y.mojito.router.get("/", function (req, res, next) {
    	res.end("Hello world.");
    });

}, "", {
	requires: ["mojito-router"]
});