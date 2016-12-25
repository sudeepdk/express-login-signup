var mongoose = require('mongoose')

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    salt: String,
    hash: String,
    firstname:String,
    lastname:String
});

module.exports = mongoose.model('users', UserSchema, 'user')


// /*
// Database and Models
// */
// mongoose.connect("mongodb://localhost/myapp");
// var UserSchema = new mongoose.Schema({
//     username: String,
//     password: String,
//     salt: String,
//     hash: String
// });

// var User = mongoose.model('users', UserSchema);
