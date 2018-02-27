const AWS = require('aws-sdk');

const makeErrorHandler = (resolve, reject, debug) => (err, data) => {
  if (err) {
    if (debug) {
      console.error(debug);
    }
    reject(err);
  } else {
    if (debug) {
      console.error(data);
    }
    resolve(data);
  }
};

class Cache {
  constructor(options = {}) {
    this.s3 = new AWS.S3();
    this.options = options;

    if (this.options.debug) {
      console.info('Cache constructor', this.options);
    }
  }

  async cacheContent(Key, content) {
    const { bucket, debug } = this.options;
    const Body = content;
    const params = { Bucket: bucket, Key, Body, ContentType: 'image/png' };

    return new Promise((resolve, reject) => {
      this.s3.putObject(params, makeErrorHandler(resolve, reject, debug));
    });
  }

  async checkExists(Key) {
    const { bucket, debug } = this.options;
    const params = { Bucket: bucket, Key };

    return new Promise((resolve, reject) => {
      this.s3.headObject(params, makeErrorHandler(resolve, reject, debug));
    });
  }

  async getContent(Key) {
    const { bucket, prefixUrl, debug } = this.options;
    const params = { Bucket: bucket, Key };

    // or getSignedUrl from s3
    return new Promise((resolve, reject) => {
      if (prefixUrl) {
        resolve(`${prefixUrl}${Key}`);

        return;
      }
      this.s3.getSignedUrl('getObject', params, makeErrorHandler(resolve, reject, debug));
    });
  }
}

module.exports = Cache;
