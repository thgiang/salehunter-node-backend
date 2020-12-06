const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false)

const mySchema = mongoose.Schema({

}, { strict: false, timestamps: true })

const WebhookLog = mongoose.model('WebhookLog', mySchema)

module.exports = WebhookLog
