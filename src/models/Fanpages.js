const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false)
const mySchema = mongoose.Schema({
  companyId: {
    type: mongoose.Types.ObjectId,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
    index: true
  },
  fbPageId: {
    type: String,
    required: true,
    unique: true
  },
  fbPageName: {
    type: String,
    required: true
  },
  fbAccessToken: {
    type: String,
    required: true
  },
  extraInfo: {
    type: Object,
    required: false
  }
}, { timestamps: true })

mySchema.statics.findByCompanyId = async (companyId) => {
  return await Fanpage.find({ companyId })
}

const Fanpage = mongoose.model('Fanpage', mySchema)

module.exports = Fanpage
