const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate')
const Profile = require('../models/Profile')

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
  fbFromId: {
    type: String,
    required: true
  },
  fbToId: {
    type: String,
    required: true
  },
  lastMessage: {
    type: Object,
    required: false,
    strict: false
  }
}, { timestamps: true, toJSON: { virtuals: true } })

mySchema.plugin(mongoosePaginate)

mySchema.virtual('fbFrom', {
  ref: 'Profile', // The model to use
  localField: 'fbFromId', // Find people where `localField`
  foreignField: 'fbId', // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: true
  // options: { sort: { name: -1 }, limit: 5 } // Query options, see http://bit.ly/mongoose-query-options
})

mySchema.virtual('fbTo', {
  ref: 'Profile', // The model to use
  localField: 'fbToId', // Find people where `localField`
  foreignField: 'fbId', // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: true
  // options: { sort: { name: -1 }, limit: 5 } // Query options, see http://bit.ly/mongoose-query-options
})

const Channel = mongoose.model('Channel', mySchema)

module.exports = Channel
