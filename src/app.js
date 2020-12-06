const cors = require('cors')
const express = require('express')
const userRouter = require('./routers/user')
const fbRouter = require('./routers/facebook')
const port = process.env.PORT
require('./db/db')
require('dotenv').config()

const app = express()
app.use(cors())
app.options('*', cors())
// app.use(express.urlencoded())
app.use(express.json())
app.use(userRouter)
app.use(fbRouter)

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
