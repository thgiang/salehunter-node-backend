const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false)

const mySchema = mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  webhookTime: {
    type: Number,
    required: true
  },
  channelId: {
    type: String,
    required: true
  },
  fbFromId: {
    type: String,
    required: true
  },
  fbToId: {
    type: String,
    required: true
  }
}, { strict: false, timestamps: true })

mySchema.index({ fbFromId: 1, fbToId: 1 })

const Message = mongoose.model('Message', mySchema)

module.exports = Message
