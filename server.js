const { Router } = require('express').Router;

const express = require('express'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	cookieParser = require('cookie-parser'),
	methodOverride = require("method-override"),
	expressLayouts = require('express-ejs-layouts'),
	morgan = require('morgan'),
	app = express(),

	passport = require('passport'),
	flash = require('connect-flash');

// Connect to Database and pass in Passport
require('./config/passport')(passport);

// Set up Cookies, BodyParser and Morgan logging
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

//EJS as View Engine
app.use(expressLayouts);
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));
app.set('view engine', 'ejs');

// Passport Sessions
app.use(session({
	secret: 'sweatykoalalover',
	resave: true,
	saveUninitialized: true
})); // session secret
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Global login state
app.use((req, res, next) => {
	res.locals.login = req.isAuthenticated();
	next();
})

// Router 
require('./routes/index')(app, passport);

// Start 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
	console.log('Press Ctrl+C to quit.');
	console.log(`NODE_ENV: ${process.env.NODE_ENV}...`)
});