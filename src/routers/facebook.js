const express = require('express')
const isArray = require('lodash/isArray')
const fbRouter = express.Router()
const util = require('util')
const auth = require('../middleware/auth')
const fb = require('../helpers/facebook')
const WebhookLog = require('../models/WebhookLog')
const Fanpage = require('../models/Fanpage')
const Message = require('../models/Message')
const Profile = require('../models/Profile')
const Channel = require('../models/Channel')
const redis = require('redis')
const redisHost = process.env.REDIS_HOST || '45.32.108.186'
const redisPass = process.env.REDIS_PASS || 'GLk5G3PaBaux58F'
const redisPort = process.env.REDIS_PORT || 6379

const redistClient = redis.createClient({ host: redisHost, password: redisPass, port: redisPort })

// for facebook verification
fbRouter.get('/' + process.env.FB_WEBHOOK_URI || 'webhook' + '/', function (req, res) {
  if (req.query['hub.verify_token'] === process.env.FB_WEBHOOK_VERIFY_TOKEN) {
    res.send(req.query['hub.challenge'])
  } else {
    res.send('Error, wrong token')
  }
})

// to post data
fbRouter.post('/' + process.env.FB_WEBHOOK_URI || 'webhook' + '/', async function (req, res) {
  const webhookLog = new WebhookLog(req.body)
  webhookLog.save()

  // console.log(util.inspect(req.body, false, null, true /* enable colors */))
  // return res.send('OK')

  if (req.body.entry && isArray(req.body.entry)) {
    for (let i = 0; i < req.body.entry.length; i++) {
      const entry = req.body.entry[i]
      const fanpage = await Fanpage.findOne({ fbPageId: entry.id })
      if (!fanpage) {
        continue
      }

      // Messenger
      if (entry.messaging && isArray(entry.messaging)) {
        for (let j = 0; j < entry.messaging.length; j++) {
          let newData = entry.messaging[j]
          newData.type = 'messenger'
          newData.fbFromId = entry.messaging[j].sender.id
          newData.fbToId = entry.id
          newData.channelId = newData.fbToId.toString() + '_' + newData.fbFromId
          newData.webhookTime = entry.time

          newData = await additionalInfo(newData)

          // Save message
          const message = new Message(newData)
          message.save()

          // Publish to redis
          redistClient.publish(fanpage.companyId.toString(), JSON.stringify(message.toObject()))
        }
      }

      // Feed
      if (entry.changes && isArray(entry.changes)) {
        for (let k = 0; k < entry.changes.length; k++) {
          if (entry.changes[k].value.item === 'reaction') {
            continue
          }

          let newData = entry.changes[k].value
          newData.type = 'feed'
          newData.fbFromId = entry.changes[k].value.from.id
          newData.fbToId = entry.id
          newData.channelId = newData.fbToId.toString() + '_' + newData.fbFromId
          newData.webhookTime = entry.time

          newData = await additionalInfo(newData)

          // Save message
          const message = new Message(newData)
          message.save()

          // Publish to redis
          redistClient.publish(fanpage.companyId.toString(), JSON.stringify(message.toObject()))
        }
      }
    }
  }

  res.sendStatus(200)
})

async function additionalInfo (newData) {
  // get profile of sender
  const fromProfile = await Profile.findOne({ fbId: newData.fbFromId })
  if (fromProfile) {
    newData.fbFrom = fromProfile.toObject()
  } else {
    const getProfile = await fb.getInfoUserFb(newData.fbFromId, fanpage.fbAccessToken)
    if (getProfile && getProfile.success) {
      getProfile.data.fbId = newData.fbFromId
      const newProfile = new Profile(getProfile.data)
      newProfile.save()

      newData.fbFrom = newProfile.toObject()
    }
  }

  // get profile of sender
  const toProfile = await Profile.findOne({ fbId: newData.fbToId })
  if (toProfile) {
    newData.fbTo = toProfile.toObject()
  } else {
    const getProfile = await fb.getInfoUserFb(newData.fbToId, fanpage.fbAccessToken)
    if (getProfile && getProfile.success) {
      getProfile.data.fbId = newData.fbToId
      const newProfile = new Profile(getProfile.data)
      newProfile.save()
      newData.fbTo = newProfile.toObject()
    }
  }

  // Channel
  const filter = { channelId: newData.channelId }
  const update = {
    channelId: newData.channelId,
    fbPageId: newData.fbToId,
    fbFrom: newData.fbFrom,
    fbTo: newData.fbTo
  }
  await Channel.countDocuments(filter) // 0
  await Channel.findOneAndUpdate(filter, update, {
    new: true,
    upsert: true // Make this update into an upsert
  })

  return newData
}

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

      await Fanpage.findOneAndUpdate(filter, update, {
        new: true,
        upsert: true // Make this update into an upsert
      })

      // subscribe app
      fb.subscribePages(page.id, page.access_token)
      // fb.requestFb('post', page.id + '/subscribed_apps', page.access_token, { access_token: page.access_token, subscribed_fields: 'feed,messages' })
    }
    res.send({ success: true, data: await Fanpage.find({ companyId: req.user.companyId }) })
  } else {
    console.log('Long live access token:', longLiveAccessToken)
    res.status(503).send({ success: false, msg: 'access_token is required' })
  }
})

module.exports = fbRouter
