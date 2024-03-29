const express = require('express')
const User = require('../models/User')
const auth = require('../middleware/auth')
const router = express.Router()

router.post('/users', async (req, res) => {
  // Create a new user
  try {
    const user = new User(req.body)
    await user.save()
    const token = await user.generateAuthToken()
    const company = await user.createCompanyForUser()
    res.status(201).send({ user, token, company })
  } catch (error) {
    res.status(400).send(error)
  }
})

router.post('/users/login', async (req, res) => {
  // Login a registered user
  try {
    const { email, password } = req.body
    const user = await User.findByCredentials(email, password)
    if (!user) {
      return res.status(401).send({ error: 'Login failed! Check authentication credentials' })
    }
    const token = await user.generateAuthToken()
    const userData = user.toObject()
    userData.token = token
    delete userData.password
    delete userData.tokens
    res.send(userData)
  } catch (error) {
    console.log(error)
    res.status(400).send(error)
  }
})

router.get('/users/me', auth, async (req, res) => {
  res.send({ user: req.user })
})

router.post('/users/logout_all', auth, async (req, res) => {
  // Log user out of all devices
  try {
    req.user.tokens.splice(0, req.user.tokens.length)
    await req.user.save()
    res.send('Bye bye')
  } catch (error) {
    res.status(500).send(error)
  }
})

router.post('/users/logout', auth, async (req, res) => {
  // Log user out of the application
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token
    })
    await req.user.save()
    res.send()
  } catch (error) {
    res.status(500).send(error)
  }
})

module.exports = router
