const crypto = require('crypto');

exports.hashData = (data) => {
  return crypto.createHash('sha3-512').update(data).digest('hex');
};

exports.TRIVIAL_PARTITION_KEY = '0';
exports.MAX_PARTITION_KEY_LENGTH = 256;
