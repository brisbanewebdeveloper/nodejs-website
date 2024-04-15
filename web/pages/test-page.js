
'use strict';

const CACHE_TTL_QUERY = 600;
const PageBase = require('./base');
const Sha1 = require('sha1');

class PageHandler extends PageBase {

  async getData() {
    const query = `
SELECT
  my_field
FROM
  my_table
WHERE
  my_field = ?
ORDER BY
  my_field DESC
    `;
    const cacheKey = `website.query.example.` + Sha1(query);
    const ret = await this.queryCached(
      this,
      cacheKey,
      {stdTTL: CACHE_TTL_QUERY},
      query,
      [threshold]
    );
    return ret.results;
  }

  async process() {

    let view = {};
    // const results = await this.getData();

    view.text = 'Hello!';
    //view.list = [];

    //results.map(r => {
    //  view.list.push(`Value: ${r.my_field}`);
    //});

    this.sendHtml({
      subtitle: 'Yay!',
      output: await this.compileAndRender('test-page.mustache', view)
    });
  }
}

module.exports = PageHandler;
