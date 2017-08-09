"use strict";

const createSandbox = () => {
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

  exposeRemoteServices(sandbox);

  return sandbox;
};

const exposeRemoteServices = (sandbox) => {
  if (process.env.GLITCHD_TOKEN === undefined) {
    return
  }

  const services = require('glitchd-client-node');
  sandbox.Buffer = Buffer;
  Object.defineProperty(sandbox, 'glitchd', {
    value: Object.create(null, {
      items: {
        value: new services.ItemsStore('services.js13kgames.com:13312', process.env.GLITCHD_TOKEN)
      }
    })
  });
};

require('fs').readFile('./public/shared.js', 'utf8', (err, shared) => {
  require('fs').readFile('./public/server.js', 'utf8', (err, code) => {
    if (err) {
      throw err
    }

    const
      express = require('express'),
      app     = express(),
      server  = require('http').Server(app),
      io      = require('socket.io')(server),
      sandbox = createSandbox();

    require('vm').runInNewContext(shared + '\n' + code, sandbox);
    io.on('connection', sandbox.module.exports);
    app.set('port', (process.env.PORT || 3000));
    app.use(express.static('public'));
    server.listen(app.get('port'), () => {
      console.log('Server started at port: ' + app.get('port'));
    });
  });
});