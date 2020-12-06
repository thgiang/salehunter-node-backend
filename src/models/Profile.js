const mongoose = require('mongoose')
const contactSchema = mongoose.Schema({
  phone: {
    type: String,
    required: false
  },
  address: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: false
  }
})
const mySchema = mongoose.Schema({
  fbId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  contact: [
    {
      type: contactSchema,
      required: false
    }
  ],
  gender: {
    type: String,
    required: false
  }
}, { timestamps: true })

const Profile = mongoose.model('Profile', mySchema)

module.exports = Profile
