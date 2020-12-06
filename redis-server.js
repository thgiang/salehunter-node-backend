const redis = require('redis')
const redisHost = '45.32.108.186'
const redisPass = 'GLk5G3PaBaux58F'
const redisPort = 6379
const redistClient = redis.createClient({ host: redisHost, password: redisPass, port: redisPort })

redistClient.on('message', function (channel, message) {
  console.log('Message: ' + message + ' on channel: ' + channel + ' is arrive!')
})
redistClient.subscribe('5fca83564fb05a1e9454adcb')
