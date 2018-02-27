# puppetshot-middleware

This is an express middleware for render screenshot for express application.

# Benifit

Integrate S3 as cache sceenshot result.

# Usage Example

``` js
var express = require('express');
var puppetshotMiddleware = require('./middleware/puppetshotMiddleware');

var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get(
  '/_snapshot/(:url)?',
  puppetshotMiddleware({
    https: false,
    maxAge: 60,
    width: 600,
    height: 600,
    timeout: 5000,
    // use s3 for cache result, leave it null if you dont need it.
    s3: {
      bucket: 'YOUR BUCKET NAME', // set your s3 bucket url
      prefixUrl: 'https://xxx.xxx.xxx', // set your cloudfront prefix url, leave it blank if you dont have it
    },
    puppeteerArgs: '', // --no-sandbox,--disable-setuid-sandbox, this is puppeteer lcaunch args
    debug: true
  })
);

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

```

# Default Options

* **https**: false
* **maxAge**: null (cache control maxAge)
* **width**: 600 (screenshot width)
* **height**: 600 (screenshot height)
* **timeout**: 5000 (puppeteer timeout millseconds)
* **s3**: null (use s3 for cache result, leave it null if you dont need it.)
  ```
  s3: {
    bucket: 'YOUR BUCKET NAME', // set your s3 bucket url
    prefixUrl: 'https://xxx.xxx.xxx', // set your cloudfront prefix url, leave it blank if you dont have it
  }
  ```
* **puppeteerArgs**: ''(this is puppeteer lcaunch args)  e.g, `--no-sandbox,--disable-setuid-sandbox`
* **debug**: false (set true if you need debug info)
