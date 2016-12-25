// This module only does the work of managing mongoDB connection

var mongoose = require('mongoose')

var dbURI = 'mongodb://localhost/myapp'

mongoose.connect(dbURI, function() {
    console.log('setup done')
})

var db_server = process.env.DB_ENV || 'primary'

// connected events
mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection open to ' + dbURI)
  console.log('Connected to ' + db_server + ' DB!')
})

mongoose.connection.on('disconnected', function () {
  console.log('Mongoose connection disconnected -> ' + dbURI)
})

mongoose.connection.on('error', function (err) {
  console.log(err)
})
// just capture OS level processes
// to monitor and handle safe closing of mongodb connection
peacefulShutdown = function (msg, callback) {
  mongoose.connection.close(function () {
    console.log('Mongoose disconnected through ' + msg)
    callback()
  })
}

// when nodemon reboots the app, capture the SIGUSR2 signal
process.once('SIGUSR2', function () {
  peacefulShutdown('nodemon restart', function () {
    process.kill(process.pid, 'SIGUSR2')
  })
})

// when local app terminates. This will rarely be fired
process.on('SIGINT', function () {
  peacefulShutdown('ST-wallet api termination', function () {
    process.exit(0)
  })
})


mongoose.set('debug', true)
