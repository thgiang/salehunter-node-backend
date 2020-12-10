const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate')

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
  },
  lastMessage: {
    type: Object,
    required: false,
    strict: false
  }
}, { timestamps: true })

mySchema.plugin(mongoosePaginate)

const Channel = mongoose.model('Channel', mySchema)

module.exports = Channel
