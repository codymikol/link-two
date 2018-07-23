"use strict";

const fs = require('fs');
const code = fs.readFileSync('./public/server.js', 'utf8');
const shared = fs.readFileSync('./public/shared.js', 'utf8');
const storage = require('./lib/storage');
const createSandbox = () => {
  const sandbox = {
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    storage: storage.interface
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

storage.init(process.env.DATABASE_URL || 'sqlite:storage.sqlite').then(() => {
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
}).catch(err => {
  console.error(err);
});
