const expect = require('expect')
const request = require('supertest')

const {app} = require('./../server')
const {Todo} = require('./../models/todo')

let text = [{
  text: 'Text one'
}, {
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
