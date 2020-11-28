const jwt = require('jsonwebtoken')
const User = require('../models/User')
const cloneDeep = require('lodash/cloneDeep')

const auth = async (req, res, next) => {
    let token = req.header('Authorization')
    if (!token) {
        res.status(401).send({error: 'Bearer token is required'})
    }

    token = token.replace('Bearer ', '')

    const data = jwt.verify(token, process.env.JWT_KEY)
    try {
        const user = await User.findOne({_id: data._id, 'tokens.token': token})
        if (!user) {
            throw new Error()
        }

        let userData = cloneDeep(user).toObject()
        userData.token = userData.tokens[userData.tokens.length - 1].token
        delete userData.tokens
        delete userData.password
        req.user = userData
        req.token = token
        next()
    } catch (error) {
        res.status(401).send({error: 'Not authorized to access this resource'})
    }
}
module.exports = auth
