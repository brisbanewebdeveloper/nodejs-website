
'use strict';

// https://www.npmjs.com/package/node-cache
const NodeCache = require('node-cache');

class PageBase {

  constructor (webServer) {
    this.ws = webServer;
  }

  initCache (key, options) {
    if ( ! this.ws.cache[key]) {
      this.ws.cache[key] = {};
      this.ws.cache[key] = new NodeCache(options);
    }
  }
  getCache (key) {
    return this.ws.cache[key].get(key);
  }
  setCache (key, value) {
    return this.ws.cache[key].set(key, value);
  }
  async queryCached (self, cacheKey, cacheOptions, query, queryParams, ignoreError) {
    this.initCache(cacheKey, cacheOptions);
    let ret = this.getCache(cacheKey);
    if (ret === undefined) {
      // console.log('No cache');
      ret = await PageBase.query(self, query, queryParams, ignoreError);
      this.setCache(cacheKey, ret);
    }
    return ret;
  }

  parseData (rawData) {

    const contentType = this.ws.req.headers['content-type'] || '';

    if (contentType.match(/application\/json/)) {
      try {
        const data = JSON.parse(rawData);
        if (data.errors === undefined) {
          return data;
        } else {
          console.log('parseJSON: Invalid data', rawData);
          return {};
        }
      } catch (e) {
        console.log('parseJSON: Malformed data', rawData, e);
        return {};
      }
    } else {
      return this.ws.qs.parse(rawData);
    }
  }

  static query (self, query, params, ignoreError) {
    return new Promise((resolve, reject) => {
      self.ws.pool.getConnection((err, conn) => {
        if (err) {
          console.log('!!!!!! Error at getting db connection', err);
          reject(err);
        }
        conn.query(query, params, (error, results, fields) => {
          conn.release();
          if (error) {
            if (ignoreError) {
              resolve();
            } else {
              console.log(`!!!!!! Error at querying to db ${error.code}: ${error.sqlMessage}`);
              console.log(query);
              console.log(params);
              reject(error);
            }
          }
          resolve({results: results, fields: fields});
        });
      });
    });
  }

  sendJson (data) {
    // @todo Compress HTML https://stackoverflow.com/questions/3894794/node-js-gzip-compression
    const output = JSON.stringify(data);
    this.ws.res.writeHead(200, {
      'Content-Type': 'application/javascript',
      'Content-Length': output.length,
      'Expires': new Date().toUTCString()
    });
    this.ws.res.write(output);
    this.ws.res.end();
  }

  sendHtml (output) {

    if ( ! output.sitename) output.sitename = this.ws.config.sitename;
    if ( ! output.subtitle) output.subtitle = '-';
    const stream = this.ws.mu.compileAndRender('index.mustache', output);

    // @todo Minify HTML https://www.npmjs.com/package/html-minifier
    // @todo https://nodejs.org/api/zlib.html
    this.ws.res.writeHead(200, {'Content-Type': 'text/html'});
    stream.pipe(this.ws.res);

    // this.ws.res.writeHead(200, {
    //   'Content-Type': 'text/html',
    //   'Content-Length': output.length,
    //   'Expires': new Date().toUTCString()
    // });
    // this.ws.res.write(output);
    // this.ws.res.end();
  }

  compileAndRender (template, view) {
    return new Promise((resolve, reject) => {
      let html = '';
      this.ws.mu.compileAndRender(template, view)
        .on('data', data => {
          html += data.toString();
        })
        .on('end', () => {
          resolve(html);
        });
    });
  }

  notFound() {
    this.ws.res.writeHead(404, {"Content-Type": "text/plain"});
    this.ws.res.end("404 Not found");
  }

  async process () {
    this.notFound();
  }
}

module.exports = PageBase;
