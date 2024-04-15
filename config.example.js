
'use strict';

let config = {};

config.db = {
  host: '127.0.0.1',
  user: 'user',
  password: 'secret',
  database: 'my_database'
};

config.privateKey = 'ssl/httpd-selfsigned.key';
config.certificate = 'ssl/httpd-selfsigned.crt';
config.port = 8080;
config.indexPage = 'test-page';
config.sitename = 'Node.js Website';

module.exports = config;
