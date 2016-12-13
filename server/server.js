const express = require('express')
const bodyParser = require('body-parser')
const {ObjectID} = require('mongodb')

const {mongoose} = require('./db/mongoose')
const {Todo} = require('./models/todo')
const {User} = require('./models/user')

let port = process.env.PORT || 3000

let app = express()

app.use(bodyParser.json())

app.post('/todos', (req, res) => {
  let newTodo = new Todo({
    text: req.body.text
  })

  newTodo.save().then((doc) => {
    res.send(doc)
  }, (e) => {
    res.status(400).send(e)
  })
})

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos})
  }, (e) => {
    res.status(404).send({e})
  })
})

app.get('/todos/:id', (req, res) => {
  let id = req.params.id

  if (!ObjectID.isValid(id)) {
    return res.status(404).send('Invalid todos ID')
  }

  Todo.findById(id).then((doc) => {
    if (!doc) {
      return res.status(404).send('Todo not found')
    }

    return res.send({doc})
  }, (e) => {
    return res.status(400).send('Error occur')
  })
})

app.delete('/todos/:id', (req, res) => {
  let id = req.params.id

  if (!ObjectID.isValid(id)) {
    return res.status(404).send('Invalid todos ID')
  }

  Todo.findByIdAndRemove(id).then((doc) => {
    if (!doc) {
      return res.status(404).send('Todo not found')
    }

    return res.send({doc})
  }, (e) => {
    return res.status(400).send('Error occur')
  })
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})

module.exports = {
  app
}
