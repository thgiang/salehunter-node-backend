const express = require('express')
const fbRouter = express.Router()

// for facebook verification
fbRouter.get('/' + process.env.FB_WEBHOOK_URI || 'webhook' + '/', function (req, res) {
  if (req.query['hub.verify_token'] === process.env.FB_WEBHOOK_VERIFY_TOKEN) {
    res.send(req.query['hub.challenge'])
  } else {
    res.send('Error, wrong token')
  }
})

// to post data
fbRouter.post('/' + process.env.FB_WEBHOOK_URI || 'webhook' + '/', function (req, res) {
  const messagingEvents = req.body.entry[0].messaging
  for (let i = 0; i < messagingEvents.length; i++) {
    const event = req.body.entry[0].messaging[i]
    const sender = event.sender.id
    if (event.message && event.message.text) {
      const text = event.message.text
      console.log(text)
      console.log(sender)
      // sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
    }
  }
  res.sendStatus(200)
})

module.exports = fbRouter
