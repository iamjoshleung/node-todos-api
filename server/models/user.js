const mongoose = require('mongoose')
const validator = require('validator')
const _ = require('lodash')
const jwt = require('jsonwebtoken')

let userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
})

userSchema.methods.toJSON = function () {
  let user = this
  let userObject = user.toObject()
  return _.pick(userObject, ['_id', 'email'])
}

userSchema.methods.generateAuthToken = function () {
  let user = this
  let access = 'auth'
  let token = jwt.sign({_id: user._id.toHexString(), access}, 'secretSalt').toString()

  user.tokens.push({access, token})

  return user.save().then(() => {
    return token
  })
}

userSchema.statics.findByToken = function (token) {
  let User = this
  let decoded

  try {
    decoded = jwt.verify(token, 'secretSalt')
  } catch (e) {
    return Promise.reject()
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  })
}

let User = mongoose.model('Users', userSchema)

module.exports = {User}
