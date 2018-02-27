'use strict';

const puppeteer = require('puppeteer');

const Cache = require('./cache');
const makeKey = require('./makeKey');


const pupperender = async (url, { width = 600, height = 600, timeout = 5000, puppeteerArgs = [] }) => {
  const browser = await puppeteer.launch({ args: puppeteerArgs });
  const page = await browser.newPage();

  await page.setViewport({ width, height });
  await page.goto(url);
  await page.waitFor(timeout);
  const screenshot = await page.screenshot();

  await browser.close();

  return screenshot;
};

const checkCache = async (path, options) => {
  const cache = new Cache(options);
  const exists = await cache.checkExists(makeKey(path));

  if (!exists) {
    return null;
  }
  const content = await cache.getContent(makeKey(path));

  return content;
};

/**
 * @export
 * @param options request options
 * @param options.https{boolean} use https or not
 * @param options.maxAge{number} for cache control max-age second
 * @param options.width{number} screenshot width pixel
 * @param options.height{number} screenshot height pixel
 * @param options.timeout{number} timeout millisecond
 * @returns
 */
function puppetshotMiddleware(
  { https = false, maxAge = null, width = 600, height = 600, timeout, s3 = null, puppeteerArgs, debug = false } = {}
) {
  if (debug) {
    console.info('options', { https, maxAge, width, height, timeout, s3, puppeteerArgs, debug });
  }
  return (req, res, next) => {
    const path = req.params.url || '';
    let checkCachePromise;

    if (s3) {
      checkCachePromise = checkCache(path, { ...s3, debug });
    } else {
      checkCachePromise = Promise.reject('s3 is null');
    }
    // if there is cache is s3
    checkCachePromise
      .then(content => {
        if (!content) {
          return Promise.reject('s3 cache empty');
        }

        return res.redirect(301, content);
      })
      .catch(() => {
        const protocol = https ? 'https' : 'http';
        const url = `${protocol}://${req.get('host')}/${path}`;

        if (debug) {
          console.info('req.connection.remoteAddress', req.connection.remoteAddress);
          console.info('req.connection.remotePort', req.connection.remotePort);
          console.info('req.protocol', req.protocol);
          console.info('url', url);
        }

        pupperender(url, { width, height, timeout, puppeteerArgs })
          .then(content => {
            res.setHeader('Content-Type', 'image/png');
            if (maxAge) {
              res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
            }
            res.send(content);

            if (s3) {
              const cache = new Cache({ ...s3, debug });
              if (debug) {
                console.log('cache to s3', cache);
              }
              cache.cacheContent(makeKey(path), content);
            }
          })
          .catch(err => {
            console.error(`[pupperender middleware] error fetching ${url}`, err);

            return next();
          });
      });
  };
}

module.exports = puppetshotMiddleware;
