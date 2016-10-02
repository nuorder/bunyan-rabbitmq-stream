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
const fp = require('lodash/fp');

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

const MARATHON_ENV_NAMES = [
  'MARATHON_APP_VERSION',
  'MARATHON_APP_LABEL_HAPROXY_GROUP',
  'HOST',
  'MARATHON_APP_RESOURCE_CPUS',
  'SERVICE_PORT',
  'MARATHON_APP_DOCKER_IMAGE',
  'MESOS_TASK_ID',
  'MARATHON_APP_RESOURCE_MEM',
  'LIBPROCESS_IP',
  'MESOS_CONTAINER_NAME',
];

const pickMarathonEnv = fp.pick(MARATHON_ENV_NAMES);

// const initialMarathonEnvs = pickMarathonEnv(process.env);

function injectMarathonEnv(entry) {
  return Object.assign({}, entry, pickMarathonEnv(entry));
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
      injectMarathonEnv,
    ]);
    const processedEntry = entryFlow(entry);
    debug('write', processedEntry);
    this.emit(this.routingKey, processedEntry);
  }
}

module.exports = BunyanRabbitMQStream;
