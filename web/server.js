
'use strict';

const config = require('../config');

const https = require('https');
const qs = require('querystring');
const fs = require('fs');
const glob = require('glob-fs')({ gitignore: true });
const options = {
  key: fs.readFileSync(config.privateKey),
  cert: fs.readFileSync(config.certificate),
};
const mimePromise = import('mime');

let cache = {};

// https://github.com/sidorares/node-mysql2
// It seems this way requires to amend many codes...
// const mysql = require('mysql2');
const mysql = require('mysql2');
//const connection = mysql.createConnection(config.db);
const pool = mysql.createPool(config.db);

// https://github.com/raycmorgan/Mu
const mu = require('mu2');
mu.root = __dirname + '/../templates';

function main() {

  const indexPage = config.indexPage;
  const pageFiles = glob.readdirSync('web/pages/*.js');
  let pageMap = {};

  pageFiles.map((page) => {
    const matches = page.match(/([^\/]+)\.js$/);
    pageMap[matches[1]] = '.' + page.replace(/web|\.js$/, ''); // web/pages/example.js => ./pages/example
  });

  function notFound(res) {
    const PageHandler = require(pageMap['base']);
    const ph = new PageHandler({
      pool: pool,
      mu: mu,
      res: res
    });
    ph.notFound();
  }

  return new Promise(async (resolve, reject) => {

    const { default : mime } = await mimePromise;

    let server = https.createServer(options, async (request, response) => {

      // console.log('request.url', request.url);
      // console.log('request.headers', request.headers);
      // console.log('request', request);

      // Static files
      if (request.url.match(/\.(css|map|js|jpg|png|otf|eot|svg|ttf|woff|woff2)(\?.*)?$/)) {

        let file = ('www/' + request.url.replace(/\.\./g, ''))
                 .replace(/\/\//g, '/')
                 .replace(/(\?.*)?$/, '');
        if (fs.existsSync(file)) {
          let mimeType = mime.getType(file);
          file = fs.readFileSync(file);
          response.writeHead(200, {
            'Content-Type': mimeType,
            'Content-Length': file.length,
            'Expires': new Date().toUTCString()
          });
          response.write(file);
          response.end();
        } else {
          notFound(response);
        }
      } else {

        const paths = request.url.match(/^\/([^/]+)?\/?([^/]+)?\/?([^/]+)?\/?([^/]+)?/);

        if (paths[0] === '/') paths[1] = indexPage;
        const page = paths[1];

        if (pageMap[page])  {

          let post = await new Promise((resolve) => {
            if (request.method === 'POST') {
              let rawData = '';
              request.on('data', (chunk) => {

                // console.log('chunk', chunk);
                rawData += chunk;

                // Kill the connection if there is too much POST data
                // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
                if (rawData.length > 1e6) {
                  console.log('FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST?', request.url, rawData);
                  response.writeHead(413, {'Content-Type': 'text/plain'}).end();
                  request.connection.destroy();
                }

              });
              request.on('end', () => {
                resolve(rawData);
              });
              request.on('error', function (error) {
                console.log('Error Receiving Request', request.url, error);
                resolve(false, rawData);
              });
            } else {
              resolve(false);
            }
          });

          const PageHandler = require(pageMap[page]);
          const ph = new PageHandler({
            cache: cache,
            config: config,
            pool: pool,
            mu: mu,
            paths: paths,
            req: request,
            qs: qs,
            post: post,
            res: response
          });
          if (ph.process) ph.process();
        } else {
          notFound(response);
        }
      }
    });
    server.listen(config.port, function() {
      console.log('Server working at https://localhost:' + config.port);
    });
  })
}
main().then(function() {
  console.log('Finished');
  connection.end();
});
