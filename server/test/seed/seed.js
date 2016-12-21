const {ObjectID} = require('mongodb')
const jwt = require('jsonwebtoken')

const {User} = require('./../../models/user')
const {Todo} = require('./../../models/todo')

const userOneId = new ObjectID()
const userTwoId = new ObjectID()

const users = [{
  _id: userOneId,
  email: 'joshuajazleung@gmail.com',
  password: '123456Pass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, 'secretSalt').toString()
  }]
}, {
  _id: userTwoId,
  email: 'joshualeung1830@gmail.com',
  password: '123456Pass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoId, access: 'auth'}, 'secretSalt').toString()
  }]
}]

const populateUsers = (done) => {
  User.remove({}).then(() => {
    let userOne = new User(users[0]).save()
    let userTwo = new User(users[1]).save()

    return Promise.all([userOne, userTwo])
  }).then(() => done())
}

const text = [{
  _id: new ObjectID(),
  text: 'Text one',
  _creator: userOneId
}, {
  _id: new ObjectID(),
  text: 'Text two',
  completed: true,
  completedAt: 333,
  _creator: userTwoId
}]

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(text)
  }).then(() => done())
}

module.exports = {users, text, populateTodos, populateUsers}
