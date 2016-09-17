/*!
 * test/test.stream.js
 */
const BrokerEmitter = require('broker-emitter');
const lib = require('./../lib');
const bunyan = require('bunyan');
const Promise = require('bluebird');
// const debug = require('debug')('test');

const RabbitMQStream = lib.stream;
const RABBIT_URI = process.env.RABBIT_URI || 'amqp://localhost';

describe('RabbitMQStream', function () {
  before(function () {
    this.stream = new RabbitMQStream({
      uri: RABBIT_URI,
      exchangeName: 'test',
      namePrefix: 'rabbitmq-stream-',
      routingKey: 'log.test',
    });

    this.log = bunyan.createLogger({
      name: 'foo',
      stream: this.stream,
      level: 'debug',
    });
    return this.stream.connect();
  });
  it('is an instance of broker-emitter', function () {
    this.stream.should.be.an.instanceOf(BrokerEmitter);
  });
  describe('#write(entry)', function () {
    before(function () {
      this.emitter = new BrokerEmitter({
        connection: this.stream.connection,
        exchangeName: 'test',
      });
    });
    this.timeout(10 * 1000);
    it('will emit to rabbitmq', function () {
      let resolve;
      const p = new Promise((r) => { resolve = r; });
      this.emitter.on('log.test', (entry) => {
        entry.getPayload()
          .then((payload) => {
            payload.should.have.property('msg', 'hello world');
            resolve();
          });
      });
      return Promise.delay(4 * 1000)
        .then(() => this.log.info('hello world'))
        .then(() => p);
    });
  });
});
