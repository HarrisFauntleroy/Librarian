// load up the user model
const mysql = require('mysql');
const dbconfig = require('../config/database');
const connection = mysql.createPool(dbconfig.connection);
connection.query('USE ' + dbconfig.database);

module.exports = function (app, passport) {

	// @route  GET /
	// @desc   Landing/Login page
	// @access Public
	app.get('/', (req, res) => {
		res.render('index');
	});

	// @route  GET /profile
	// @desc   View logged in user profile
	// @access Private
	app.get('/profile', isLoggedIn, (req, res) => {
		let sql = 'SELECT * FROM book, bookplot WHERE bookplot.BookID = book.BookID';
		connection.query(sql, (err, result, fields) => {
			if (err) throw err;
			console.log(req.user)
			res.render('profile', {
				user: req.user,
				result,
				table: 'everything'
			});
		});
	});

	// @route  GET /books
	// @desc   View all books
	// @access Private
	app.get('/books', isLoggedIn, (req, res) => {
		let sql = 'SELECT * FROM book, bookplot WHERE bookplot.BookID = book.BookID';
		connection.query(sql, (err, result, fields) => {
			if (err) throw err;
			res.render('books', {
				user: req.user,
				result,
				table: 'books'
			});
		});
	});

	// @route  GET /authors
	// @desc   View all author profiles
	// @access Private
	app.get('/authors', isLoggedIn, (req, res) => {
		let sql = 'SELECT * FROM author';
		connection.query(sql, (err, result, fields) => {
			if (err) throw err;
			res.render('authors', {
				result,
				table: 'authors'
			});
		});
	});

	// @route  GET /users
	// @desc   View all user accounts
	// @access Private
	app.get('/users', isLoggedIn, (req, res) => {
		let sql = 'SELECT * FROM users';
		connection.query(sql, (err, result, fields) => {
			if (err) throw err;
			res.render('users', {
				result,
				table: 'users',
				message: req.flash('signupMessage')
			});
		});
	});

	// @route  GET api/posts
	// @desc   GET Login page
	// @access Public
	app.get('/login', function (req, res) {
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// @route  POST /login
	// @desc   POST login data to server
	// @access Public
	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/profile',
		failureRedirect: '/login',
		failureFlash: true
	}),
		function (req, res) {
			console.log("hello");

			if (req.body.remember) {
				req.session.cookie.maxAge = 1000 * 60 * 3;
			} else {
				req.session.cookie.expires = false;
			}
			res.redirect('/');
		});

	// @route  POST /signup
	// @desc   Create a new user
	// @access Private
	app.post('/addUser', isLoggedIn, (req, res) => {
		let sql = `INSERT INTO login(username, password, accessRights) VALUES ${req.body.email}, ${req.body.password}, ${req.body.accessRights}`;
		connection.query(sql, (err, result, fields) => {
			console.log(sql)
			if (err) throw err;
			res.render('users', {
				result,
				table: 'users',
				message: req.flash('signupMessage')
			});
		});
	});

	// @route  GET /logout
	// @desc   Log user out
	// @access Private
	app.get('/logout', isLoggedIn, (req, res) => {
		req.logout();
		res.redirect('/');
	});
};

// Check user login status
function isLoggedIn(req, res, next) {

	// If logged in, continue...
	if (req.isAuthenticated())
		return next();

	// Else redirect home
	res.redirect('/');
}
