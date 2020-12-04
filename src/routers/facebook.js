const express = require('express')
const fbRouter = express.Router()
const auth = require('../middleware/auth')
const fb = require('../helpers/facebook')
const Fanpage = require('../models/Fanpages')

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

fbRouter.get('/pages', auth, async function (req, res) {
  res.send({ success: true, data: await Fanpage.find({ companyId: req.user.companyId }) })
})

fbRouter.get('/pages/add', auth, async function (req, res) {
  if (!req.query.access_token) {
    res.status(403).send({ success: false, msg: 'access_token is required' })
  }

  const longLiveAccessToken = await fb.longLiveAccessToken(req.query.access_token)
  if (longLiveAccessToken && longLiveAccessToken.success) {
    req.user.fbAccessToken = longLiveAccessToken.data.access_token
    req.user.save()
    const pages = await fb.getPages(longLiveAccessToken.data.access_token)
    const results = []
    for (let i = 0; i < pages.data.length; i++) {
      const page = pages.data[i]
      const filter = { fbPageId: page.id }
      const update = {
        companyId: req.user.companyId,
        userId: req.user._id,
        fbPageId: page.id,
        fbAccessToken: page.access_token,
        fbPageName: page.name,
        extraInfo: page
      }

      await Fanpage.countDocuments(filter) // 0

      const newFanpage = await Fanpage.findOneAndUpdate(filter, update, {
        new: true,
        upsert: true // Make this update into an upsert
      })
      results.push(newFanpage)
    }
    res.send({ success: true, data: results })
  } else {
    console.log('Long live access token:', longLiveAccessToken)
    res.status(503).send({ success: false, msg: 'access_token is required' })
  }
})

module.exports = fbRouter
