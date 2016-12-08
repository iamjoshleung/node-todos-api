const {MongoClient, ObjectID} = require('mongodb')

MongoClient.connect('mongodb://localhost:27017/ToDoApp', (err, db) => {
  if (err) return console.log('Connection Error', err)

  console.log('Connected to Mongodb successfully')

  // db.collection('Users').deleteMany({name: 'Andrew'}).then((results) => {
  //   console.log(JSON.stringify(results, undefined, 2))
  // }, (err) => {
  //   console.log('Error: ', err)
  // })

  //58490658deb94b4410934ef4

  db.collection('Users').findOneAndDelete({_id: new ObjectID('58490658deb94b4410934ef4')}).then((results) => {
    console.log(JSON.stringify(results, undefined, 2))
  }, (err) => {
    console.log('Error: ', err)
  })

})
