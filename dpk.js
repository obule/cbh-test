const { hashData, MAX_PARTITION_KEY_LENGTH, TRIVIAL_PARTITION_KEY } = require('./util');

exports.deterministicPartitionKey = (event) => {
  const partitionKey = getPartitionKey(event);
  const isGreaterThanMaxPartitionKey = partitionKey.length > MAX_PARTITION_KEY_LENGTH;
  if (!isGreaterThanMaxPartitionKey) {
    return partitionKey;
  }
  return hashData(partitionKey);
};

const getPartitionKey = (event) => {
  if (!event) {
    return TRIVIAL_PARTITION_KEY;
  }
  return getPartitionKeyFromEvent(event);
};

const getPartitionKeyFromEvent = (event) => {
  // Making assumption that partition key can be 0 and other JS primitives
  const validPartitionKey = typeof event.partitionKey !== 'undefined';
  if (!validPartitionKey) {
    const eventString = JSON.stringify(event);
    return hashData(eventString);
  }
  const partitionKey =
    typeof event.partitionKey !== 'string'
      ? JSON.stringify(event.partitionKey)
      : event.partitionKey;

  return partitionKey;
};
