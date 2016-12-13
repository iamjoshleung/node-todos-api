const expect = require('expect')
const request = require('supertest')
const {ObjectID} = require('mongodb')

const {app} = require('./../server')
const {Todo} = require('./../models/todo')

let text = [{
  _id: new ObjectID(),
  text: 'Text one'
}, {
  _id: new ObjectID(),
  text: 'Text two'
}]

beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(text)
  }).then(() => done())
})

// describe('PSOT /todos', () => {
//   it('should create a new todo', (done) => {
//     let text = 'lunch test'
//
//     request(app)
//       .post('/todos')
//       .send({text})
//       .expect(200)
//       .expect((res) => {
//         expect(res.body.text).toBe(text)
//       })
//       .end((err, res) => {
//         if (err) return done(err)
//
//         Todo.find().then((todos) => {
//           expect(todos.length).toBe(1)
//           expect(todos[0].text).toBe(text)
//           done()
//         }).catch((e) => done(e))
//       })
//   })
//
//   it('should NOT create a todo with invalid body data', (done) => {
//     request(app)
//       .post('/todos')
//       .send({})
//       .expect(400)
//       .end((err, res) => {
//         if (err) return done(err)
//
//         Todo.find().then((todos) => {
//           expect(todos.length).toBe(0)
//           done()
//         }).catch((e) => done(e))
//       })
//   })
//
//
// })

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
