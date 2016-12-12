const {mongoose} = require('../server/db/mongoose')
const {User} = require('../server/models/user')

let id = '584e8f0e686ed11cc9eb595d1'

User.findById(id).then((doc) => {
  if (!doc) return console.log('User not found')

  console.log('User found', doc)
}).catch((e) => console.log(e))
