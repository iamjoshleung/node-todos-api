const {MongoClient, ObjectID} = require('mongodb')

MongoClient.connect('mongodb://localhost:27017/ToDoApp', (err, db) => {
  if (err) return console.log('Connection Error', err)

  console.log('Connected to Mongodb successfully')

  db.collection('Users').findOneAndUpdate(
    { _id: new ObjectID("5848ff08a39a2f8835134073") },
    { $set: { name: 'Mikey' }, $inc: { age: 1 } },
    { returnOriginal: false }
  ).then((results) => {
    console.log(JSON.stringify(results, undefined, 2))
  })

})
