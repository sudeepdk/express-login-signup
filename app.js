/*
Module Dependencies 
*/
var express = require('express'),
    http = require('http'),
    path = require('path'),
    bodyParser = require('body-parser'),

    hash = require('./pass').hash;

var app = express();


var mongoose = require('mongoose')
require('./config/db');// keep the connection open to db when app boots/reboots

var usr   = require('./models/users.js');

var helper = require('./helper/util.js')


/*
Middlewares and configurations 
*/
app.configure(function () {
    app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))
    app.use(express.cookieParser('Authentication'));
    app.use(express.session());
    app.use(express.static(__dirname + '/public'));
});

// 
// set the view engine to ejs
app.set('view engine', 'ejs');

// handle success error 
app.use(function (req, res, next) {
    var err = req.session.error,
        msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    res.locals.message = '';
    if (err) res.locals.message =  err ;
    if (msg) res.locals.message =  msg ;
    next();
});
/*
Routes
*/
app.get("/", function (req, res) {

    if (req.session.user) {
        res.send("Welcome " + req.session.user.username + "<br>" + "<a href='/logout'>logout</a>");
    } else {
        // res.send("<a href='/login'> Login</a>" + "<br>" + "<a href='pages/signup'> Sign Up</a>");
        res.render('pages/index');
    }
});

app.get("/signup", function (req, res) {
    if (req.session.user) {
        res.redirect("/");
    } else {
        res.render('pages/signup');
    }
});

// about page 
app.get('/about', function(req, res) {
    res.render('pages/about');
});
app.post("/signup", helper.userExist, function (req, res) {
    var password = req.body.password;
    var username = req.body.username;

    hash(password, function (err, salt, hash) {
        if (err) throw err;
        var user = new usr({
            username: username,
            salt: salt,
            hash: hash,
        }).save(function (err, newUser) {
            if (err) throw err;
            helper.authenticate(newUser.username, password, function(err, user){
                if(user){
                    req.session.regenerate(function(){


                        req.session.user = user;
                        req.session.success = 'Authenticated as ' + user.username + ' click to <a href="/logout">logout</a>. ' + ' You may now access <a href="/restricted">/restricted</a>.';
                        res.redirect('/');
                    });
                }
            });
        });
    });
});

app.get("/login", function (req, res) {
    res.render("pages/login");
});

app.post("/login", function (req, res) {
    helper.authenticate(req.body.username, req.body.password, function (err, user) {
        if (user) {

            req.session.regenerate(function () {
                res.locals.user = user;

                req.session.user = user;
                req.session.success = 'Authenticated as ' + user.username + ' click to <a href="/logout">logout</a>. ' + ' You may now access <a href="/restricted">/restricted</a>.';
                // res.redirect('/');
                res.render('pages/about')

            });
        } else {
            req.session.error = 'Authentication failed, please check your ' + ' username and password.';
            res.redirect('/login');
        }
    });
});

app.get('/logout', function (req, res) {
    req.session.destroy(function () {
        res.redirect('/');
    });
});

app.get('/profile', helper.requiredAuthentication, function (req, res) {
    res.send('Profile page of '+ req.session.user.username +'<br>'+' click to <a href="/logout">logout</a>');
});


http.createServer(app).listen(3001);
console.log('server running on 3001')