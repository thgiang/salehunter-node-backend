const mongoose = require('mongoose')

const mySchema = mongoose.Schema({
  channelId: {
    type: String,
    required: true,
    unique: true
  },
  fbPageId: {
    type: String,
    required: true,
    index: true
  },
  fbFrom: {
    type: Object,
    required: true
  },
  fbTo: {
    type: Object,
    required: true
  }
}, { timestamps: true })

const Channel = mongoose.model('Channel', mySchema)

module.exports = Channel
