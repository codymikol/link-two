"use strict";

function createSandbox() {
    var sandbox = Object.create(null);
	Object.defineProperty(sandbox, 'module', {
		enumerable: true,
		configurable: false,
		writable: false,
		value: Object.create(null)
	});
	sandbox.module.exports = Object.create(null);
	sandbox.exports = sandbox.module.exports;
    sandbox.console = console;
    sandbox.setTimeout = setTimeout;
    sandbox.setInterval = setInterval;
    sandbox.clearTimeout = clearTimeout;
    sandbox.clearInterval = clearInterval;
	return sandbox;
};

require('fs').readFile('./dist/server.js', 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }

    var express = require("express"),
        app = express(),
        server = require("http").Server(app),
        io = require("socket.io")(server),
        sandbox = createSandbox();

	require('vm').runInNewContext(data, sandbox);
    io.on('connection', sandbox.module.exports);
    app.set('port', (process.env.PORT || 3000));
    app.use(express.static('dist'));
    server.listen(app.get('port'), function () {
        console.log("Server started");
    });
});
