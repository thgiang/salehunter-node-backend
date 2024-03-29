const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async (req, res, next) => {
  let token = req.header('Authorization')
  if (!token) {
    return res.status(401).send({ error: 'Bearer token is required' })
  }

  token = token.replace('Bearer ', '')

  const data = jwt.verify(token, process.env.JWT_KEY)
  try {
    const user = await User.findOne({ _id: data._id, 'tokens.token': token })
    if (!user) {
      throw new Error()
    }

    req.user = user
    req.token = token
    next()
  } catch (error) {
    return res.status(401).send({ error: 'Not authorized to access this resource' })
  }
}
module.exports = auth
