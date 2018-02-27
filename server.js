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
      bucket: '', // set your s3 bucket url
      prefixUrl: '', // set cloudfront prefix url
    },
    puppeteerArgs: '', // --no-sandbox,--disable-setuid-sandbox, this is puppeteer lcaunch args
    debug: true
  })
);

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

