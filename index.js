"use strict";

function createSandbox() {
  const sandbox = {
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval
  };

  Object.defineProperty(sandbox, 'module', {
    enumerable: true,
    configurable: false,
    writable: false,
    value: Object.create(null)
  });
  sandbox.module.exports = Object.create(null);
  sandbox.exports = sandbox.module.exports;
  return sandbox;
};

require('fs').readFile('./public/shared.js', 'utf8', (err, shared) => {
  require('fs').readFile('./public/server.js', 'utf8', (err, code) => {
    if (err) {
      throw err;
    }

    const express = require('express');
    const app = express();
    const server = require('http').Server(app);
    const io = require('socket.io')(server);
    const sandbox = createSandbox();

    require('vm').runInNewContext(shared + '\n' + code, sandbox);
    io.on('connection', sandbox.module.exports);
    app.set('port', (process.env.PORT || 3000));
    app.use(express.static('public'));
    server.listen(app.get('port'), () => {
      console.log('Server started at port: ' + app.get('port'));
    });
  });
});