const MongoClient = require('mongodb').MongoClient

MongoClient.connect('mongodb://localhost:27017/ToDoApp', (err, db) => {
  if (err) return console.log('Connection Error', err)

  console.log('Connected to Mongodb successfully')

  db.collection('users').insertOne({
    name: 'Joshua Leung',
    age: 22,
    location: 'Hong Kong'
  }, (err, result) => {
    if (err) return console.log('InsertOne Error', err)

    console.log(JSON.stringify(result.ops, undefined, 2))
  })
})
