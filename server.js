const express = require('express'),
	morgan = require('morgan'),
	passport = require('passport'),
	flash = require('connect-flash'),
	session = require('express-session'),
	cookieParser = require('cookie-parser'),
	fileUpload = require("express-fileupload"),
	expressLayouts = require('express-ejs-layouts');

app = express(),

	// Connect to Database and pass in Passport
	require('./config/passport')(passport);

// Set up Cookies, BodyParser and Morgan logging
app.use(morgan('dev'));
app.use(cookieParser());

// Express Layouts
app.use(expressLayouts);

// Embedded Javascript View Engine
app.set('view engine', 'ejs');

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File Upload
app.use(fileUpload());

// Absolute Paths
app.use(express.static("./public"));

// Passport Sessions
app.use(session({
	secret: 'sweatykoalalover',
	resave: true,
	saveUninitialized: true
})); // session secret
app.use(passport.initialize());
app.use(passport.session());

// Flash Messages
app.use(flash());

// Routes
app.use('/', require('./routes/index'));
app.use('/', require('./routes/users'));
app.use('/', require('./routes/books'));


// Start 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`App listening on port ${PORT}`);
	console.log('Press Ctrl+C to quit.');
	console.log(`NODE_ENV: ${process.env.NODE_ENV}...`)
});