

// create express app
var express = require('express');
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// mongoose + cookie setup
var Final = require("./final.js");
var clientSessions = require('client-sessions');

app.use(clientSessions({
    cookieName: 'session',
    secret: "final_secret",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60
    }));

    app.use(function (req, res, next) {
        res.locals.session = req.session;
        next();
    });
    
    ensureLogin = function (req, res, next) {
        if (!req.session.user) {
            res.redirect("/login");
        } else {
            next();
        }
    };

    // include writing to a file
    var fs = require('fs');
    var path = require('path');
    
    //setup http server to listen on HTTP_PORT
    const HTTP_PORT = process.env.PORT || 8080;
    function onHttpStart() {
        console.log("Express http server listening on: " + HTTP_PORT);
    };

    Final.startDB().then(function () {
        app.listen(HTTP_PORT, onHttpStart);
    }).catch(function (err) {
        console.log("unable to start server: " + err);
    });

    //home page route
    app.get("/", function (req, res) {
        res.sendFile(path.join(__dirname, "/views/home.html"));
    });

    //login page route
    app.get("/login", function (req, res) {
        res.sendFile(path.join(__dirname, "/views/login.html"));
    });

    //signup page route
    app.get("/signin", function (req, res) {
        res.sendFile(path.join(__dirname, "/views/signin.html"));
    });

    //logout route
    app.get("/logout", function (req, res) {
        req.session.reset();
        res.redirect("/login");
    });

    //register page route
    app.get("/register", function (req, res) {
        res.sendFile(path.join(__dirname, "/views/register.html"));
    });


    //login page post route
   //Post Login
app.post('/login', function (req, res) {
    Final.signIn(req.body).then(() => {
        res.send(req.body.email + " signed in successfully");
    }).catch((err) => {
        res.send(err);
    });
});

     //register page post route
     app.post('/register', function (req, res) {
        Final.register(req.body).then(() => {
            res.send(req.body.email + " registered successfully");
        });
    });



    