/*!
 * Bunyan RabbitMQ Logger
 *
 * @author Chen Liang [code@chen.technology]
 */

/*!
 * Module dependencies.
 */
const brokerEmitter = require('broker-emitter');
const _ = require('lodash');

const debug = require('debug')('bunyan-rabbitmq-stream');

function parseStringEntry(entry) {
  if (_.isString(entry)) {
    return JSON.parse(entry);
  }
  return entry;
}

function timeToTimestamp(entry) {
  if (entry.time && entry.time.getTime) {
    return _.assign({}, entry, {
      '@time': entry.time.getTime(),
    });
  }
  return _.assign({}, entry, {
    '@time': entry.time,
  });
}

/**
 * BunyanRabbitMQStream
 *
 * @param {object} options
 * @param {string} optinos.uri rabbitmq connection string
 * @param {broker.node.connection} options.connection use an existing connection
 * @param {string} options.exchangeName rabbitmq exchange name
 * @param {string} options.namePrefix consumer queue name prefix
 * @param {string} options.routingKey log default routing key
 * @param {string} options.exchangeType @default topic
 */
class BunyanRabbitMQStream extends brokerEmitter {
  write(entry) {
    const entryFlow = _.flow([
      parseStringEntry,
      timeToTimestamp,
    ]);
    const processedEntry = entryFlow(entry);
    debug('write', processedEntry);
    this.emit(this.routingKey, processedEntry);
  }
}

module.exports = BunyanRabbitMQStream;
