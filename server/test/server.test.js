const expect = require('expect')
const request = require('supertest')
const {ObjectID} = require('mongodb')

const {app} = require('./../server')
const {Todo} = require('./../models/todo')
const {User} = require('./../models/user')

const {text, users, populateUsers, populateTodos} = require('./seed/seed')

beforeEach(populateUsers)
beforeEach(populateTodos)

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2)
      })
      .end(done)
  })
})

describe('GET /todos/:id', () => {
  it('should return a todo doc', (done) => {
    request(app)
      .get(`/todos/${text[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.doc.text).toBe(text[0].text)
      })
      .end(done)
  })

  it('should return 404 when todo not found', (done) => {
    let id = new ObjectID()

    request(app)
      .get(`/todos/${id.toHexString()}`)
      .expect(404)
      .end(done)
  })

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get('/todos/123')
      .expect(404)
      .end(done)
  })
})

describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    let hexId = text[1]._id.toHexString()

    request(app)
      .delete(`/todos/${hexId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.doc._id).toBe(hexId)
      })
      .end((err, res) => {
        if (err) return done(err)

        Todo.findById(hexId).then((doc) => {
          expect(doc).toNotExist()
          done()
        }).catch((e) => done(e))
      })
  })

  it('should return 404 when todo not found', (done) => {
    let id = new ObjectID()

    request(app)
      .delete(`/todos/${id.toHexString()}`)
      .expect(404)
      .end(done)
  })

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .delete('/todos/123')
      .expect(404)
      .end(done)
  })
})

describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    let hexId = text[0]._id.toHexString()
    let updatedTodo = {
      text: 'updated todo',
      completed: true
    }

    request(app)
      .patch(`/todos/${hexId}`)
      .send(updatedTodo)
      .expect(200)
      .expect((res) => {
        expect(res.body.doc.text).toBe(updatedTodo.text)
        expect(res.body.doc.completed).toBe(true)
        expect(res.body.doc.completedAt).toBeA('number')
      })
      .end(done)

  })

  it('should clear completedAt when todo is not completed', (done) => {
    let hexId = text[1]._id.toHexString()
    let updatedTodo = {
      text: 'updated todo second',
      completed: false
    }

    request(app)
      .patch(`/todos/${hexId}`)
      .send(updatedTodo)
      .expect(200)
      .expect((res) => {
        expect(res.body.doc.text).toBe(updatedTodo.text)
        expect(res.body.doc.completed).toBe(false)
        expect(res.body.doc.completedAt).toNotExist()
      })
      .end(done)
  })
})

describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString())
        expect(res.body.email).toBe(users[0].email)
      })
      .end(done)
  })

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({})
      })
      .end(done)
  })
})

describe('POST /users', () => {
  it('should create a user', (done) => {
    let email = 'joshuajazleung213112@gmail.com'
    let password = '123456Pass'

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist()
        expect(res.body.email).toBe(email)
        expect(res.body._id).toExist()
      })
      .end((err) => {
        if (err) return done(err)

        User.findOne({email}).then((user) => {
          expect(user).toExist()
          expect(user.password).toNotBe(password)
          done()
        }).catch((e) => done(e))
      })
  })

  it('should return validation errors if request invalid', (done) => {
    let email = 'dgsagre'
    let password = '222'

    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toNotExist()
      })
      .end(done)
  })

  it('should not create user if email in user', (done) => {
    request(app)
      .post('/users')
      .send({
        email: users[0].email,
        password: '123456Pass'
      })
      .expect(400)
      .end(done)
  })
})

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist()
      })
      .end((err, res) => {
        if (err) return done(err)

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[0]).toInclude({
            access: 'auth',
            token: res.headers['x-auth']
          })
          done()
        }).catch((e) => done(e))
      })
  })

  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password + 'make it invalid'
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toNotExist()
      })
      .end((err, res) => {
        if (err) return done(err)

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(0)
          done()
        }).catch((e) => done(e))
      })
  })
})
