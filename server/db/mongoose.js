const mongoose = require('mongoose')

mongoose.Promise = global.Promise

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Todos')

console.log(process.env.MONGODB_URI)

module.exports = {
  mongoose
}
