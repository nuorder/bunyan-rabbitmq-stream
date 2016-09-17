# bunyan-rabbitmq-stream
RabbitMQ WriteStream for Bunyan

## Docs

```js
const RabbitMQStream = require('bunyan-rabbitmq-stream');

const logStream = new RabbitmqLogStream(options);
const bunyan = require('bunyan');

const log = bunyan.createLogger({
  name: 'logger',
  stream: logStream,
});

```

### Options
* @param {object} **options**
* @param {string} **optinos.uri** rabbitmq connection string
* @param {broker.node.connection} **options.connection** use an existing connection
* @param {string} **options.exchangeName** rabbitmq exchange name
* @param {string} **options.namePrefix** consumer queue name prefix
* @param {string} **options.routingKey** log default routing key
* @param {string} **options.exchangeType** @default topic
