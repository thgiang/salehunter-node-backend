const mongoose = require('mongoose')

const mySchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Types.ObjectId,
    required: true
  }
}, { timestamps: true })

const myModel = mongoose.model('Comapny', mySchema)

module.exports = myModel
