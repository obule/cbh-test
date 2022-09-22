const { deterministicPartitionKey } = require('./dpk');
const { hashData, TRIVIAL_PARTITION_KEY, MAX_PARTITION_KEY_LENGTH } = require('./util');

describe('deterministicPartitionKey', () => {
  describe('with no input', () => {
    it("Returns the literal '0'", () => {
      const trivialKey = deterministicPartitionKey();
      expect(trivialKey).toBe(TRIVIAL_PARTITION_KEY);
    });
  });

  describe('when input is supplied', () => {
    describe('when event candidate length is less than max partition key length', () => {
      describe('when event partition key is defined', () => {
        describe('when event partition key is not a string', () => {
          it('returns stringified partition key', () => {
            const event = { partitionKey: { data: 10 } };
            const partitionKey = deterministicPartitionKey(event);
            expect(partitionKey).toEqual(JSON.stringify(event.partitionKey));
          });
        });

        describe('when partition key is a string', () => {
          it('returns the events partition key', () => {
            const event = { partitionKey: 'FooBar' };
            const partitionKey = deterministicPartitionKey(event);
            expect(partitionKey).toBe(event.partitionKey);
          });
        });
      });

      describe('when event partition key is not defined', () => {
        it('returns the hash of the event', () => {
          const event = { data: 'foobar' };
          const partitionKey = deterministicPartitionKey(event);
          expect(partitionKey).toBe(hashData(JSON.stringify(event)));
        });
      });
    });

    describe('when event candidate length is greater than max partition key length', () => {
      it('returns that hash of the event partition key', () => {
        const event = { partitionKey: 'a'.repeat(MAX_PARTITION_KEY_LENGTH + 1) };
        const partitionKey = deterministicPartitionKey(event);
        expect(partitionKey).toBe(hashData(event.partitionKey));
      });
    });
  });
});
