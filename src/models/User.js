const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Company = require('./Company')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: value => {
      if (!validator.isEmail(value)) {
        throw new Error({ error: 'Invalid Email address' })
      }
    }
  },
  password: {
    type: String,
    required: true,
    minLength: 7
  },
  companyId: {
    type: mongoose.Types.ObjectId,
    required: false
  },
  fbAccessToken: {
    type: String,
    required: false,
    default: ''
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  // Hash the password before saving the user model
  const user = this
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }
  next()
})

userSchema.methods.generateAuthToken = async function () {
  // Generate an auth token for the user
  const user = this
  const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY, {
    expiresIn: '7d'
  })
  user.tokens = user.tokens.concat({ token })
  await user.save()
  return token
}

userSchema.methods.createCompanyForUser = async function () {
  const user = this
  const company = new Company({ name: user.name, userId: user._id })
  await company.save()
  user.companyId = company._id
  await user.save()
  return company
}
userSchema.statics.findByCredentials = async (email, password) => {
  // Search for a user by email and password.
  const user = await User.findOne({ email })
  if (!user) {
    return false
  }
  const isPasswordMatch = await bcrypt.compare(password, user.password)
  if (!isPasswordMatch) {
    return false
  }
  return user
}

const User = mongoose.model('User', userSchema)

module.exports = User
