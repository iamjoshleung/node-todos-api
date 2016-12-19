const mongoose = require('mongoose')
const validator = require('validator')
const _ = require('lodash')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

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

userSchema.pre('save', function (next) {
  let user = this

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash
        next()
      })
    })
  } else {
    next()
  }
})

userSchema.statics.findByCredentials = function (email, password) {
  let User = this

  return User.findOne({email}).then((user) => {
    if (!user) {
      return Promise.reject('User not found')
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (err) return reject(err)
        if (!res) return reject('Password not matched')
        return resolve(user)
      })
    })
  })
}

let User = mongoose.model('Users', userSchema)

module.exports = {User}
