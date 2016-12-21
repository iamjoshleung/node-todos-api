require('./config/config')

const express = require('express')
const bodyParser = require('body-parser')
const {ObjectID} = require('mongodb')
const _ = require('lodash')

const {mongoose} = require('./db/mongoose')
const {Todo} = require('./models/todo')
const {User} = require('./models/user')
const {authenticate} = require('./middlewares/auth')

const bcrypt = require('bcryptjs')

let port = process.env.PORT || 3000

let app = express()

app.use(bodyParser.json())

app.post('/todos', authenticate, (req, res) => {
  let newTodo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  })

  newTodo.save().then((doc) => {
    res.send(doc)
  }, (e) => {
    res.status(400).send(e)
  })
})

app.get('/todos', authenticate, (req, res) => {
  Todo.find({_creator: req.user._id}).then((todos) => {
    res.send({todos})
  }, (e) => {
    res.status(404).send({e})
  })
})

app.get('/todos/:id', authenticate, (req, res) => {
  let id = req.params.id

  if (!ObjectID.isValid(id)) {
    return res.status(404).send('Invalid todos ID')
  }

  Todo.findOne({_id: id, _creator: req.user._id}).then((doc) => {
    if (!doc) {
      return res.status(404).send('Todo not found')
    }

    return res.send({doc})
  }, (e) => {
    return res.status(400).send('Error occur')
  })
})

app.delete('/todos/:id', authenticate, (req, res) => {
  let id = req.params.id

  if (!ObjectID.isValid(id)) {
    return res.status(404).send('Invalid todos ID')
  }

  Todo.findOneAndRemove({_id: id, _creator: req.user._id}).then((doc) => {
    if (!doc) {
      return res.status(404).send('Todo not found')
    }

    return res.send({doc})
  }, (e) => {
    return res.status(400).send('Error occur')
  })
})

app.patch('/todos/:id', authenticate, (req, res) => {
  let id = req.params.id

  let body = _.pick(req.body, ['text', 'completed'])

  if (!ObjectID.isValid(id)) {
    return res.status(404).send()
  }

  if(_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime()
  } else {
    body.completed = false
    body.completedAt = null
  }

  Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {
    $set: body
  }, {
    'new': true
  }).then((doc) => {
    if (!doc) return res.status(404).send()

    res.send({doc})
  }).catch((e) => res.status(400).send())
})

app.post('/users', (req, res) => {
  let body = _.pick(req.body, ['email', 'password'])

  let newUser = new User(body)

  newUser.save().then(() => {
    return newUser.generateAuthToken()
  }).then((token) => {
    res.header('x-auth', token).send(newUser)
  }).catch((e) => res.status(400).send(e))
})

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user)
})

app.post('/users/login', (req, res) => {
  let body = _.pick(req.body, ['email', 'password'])

  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send({user})
    })
  }).catch((e) => {
    res.status(400).send()
  })

})

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.send()
  }, () => {
    res.status(400).send()
  })
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})

module.exports = {
  app
}
