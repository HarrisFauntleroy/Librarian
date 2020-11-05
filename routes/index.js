// load up the user model
const mysql = require('mysql');
const bcrypt = require('bcrypt-nodejs');
const dbconfig = require('../config/database');
const connection = mysql.createPool(dbconfig.connection);
connection.query('USE ' + dbconfig.database);

module.exports = function (app, passport) {

	//////////////////////////////////////////////////////////////////
	// LOGIN / LOGOUT
	//////////////////////////////////////////////////////////////////

	// @route  GET /

	// @desc   Login page
	// @access Public
	app.get('/', (req, res) => {
		res.render('index', {
			layout: false,
			message: req.flash('loginMessage')
		});
	});

	// @route  GET /logout
	// @desc   Logout page
	// @access Private
	app.get('/logout', isLoggedIn, (req, res) => {
		req.logout();
		res.redirect('/');
	});

	// @route  GET /profile
	// @desc   View logged in user profile
	// @access Private
	app.get('/profile', isLoggedIn, (req, res) => {
		let sql = 'SELECT * FROM login';
		connection.query(sql, (err, result, fields) => {
			if (err) throw err;
			res.render('profile', {
				user: req.user,
				result,
				table: 'everything'
			});
		});
	});

	// @route  POST /login
	// @desc   POST login data to server
	// @access Public
	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/profile',
		failureRedirect: '/',
		failureFlash: true
	}),
		function (req, res) {
			if (req.body.remember) {
				req.session.cookie.maxAge = 1000 * 60 * 3;
			} else {
				req.session.cookie.expires = false;
			}
			res.redirect('/');
		});

	//////////////////////////////////////////////////////////////////
	// BOOKS
	//////////////////////////////////////////////////////////////////

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
				table: 'books',
				message: req.flash('signupMessage')
			});
		});
	});

	// Delete Book
	app.post('/deleteBook', isLoggedIn, (req, res) => {
		let sql = `DELETE FROM books where BookID = ${req.body.delete}`;
		connection.query(sql, (err, result, fields) => {
			if (err) throw err;
			console.log(`Deleted Book with ID: ${req.body.delete}`)
			let refresh = 'SELECT * FROM books';
			connection.query(refresh, (err, result, fields) => {
				if (err) throw err;
				res.redirect('books')
			});
		});
	});

	// Update Book
	app.post('/updateBook', isLoggedIn, (req, res) => {
		let sql = `DELETE FROM books where BookID = ${req.body.update}`;
		connection.query(sql, (err, result, fields) => {
			if (err) throw err;
			console.log(`Updated Book with ID: ${req.body.update}`)
			let refresh = 'SELECT * FROM books';
			connection.query(refresh, (err, result, fields) => {
				if (err) throw err;
				res.redirect('books')
			});
		});
	});

	// ADD BOOK
	app.post('/addBook', isLoggedIn, (req, res) => {

		connection.getConnection(function (err, conn) {

			conn.beginTransaction(function (err) {
				if (err) { throw err; }

				var authorSql = {
					Name: req.body.Name,
					Surname: req.body.Surname,
					Nationality: req.body.Nationality,
					BirthYear: req.body.BirthYear,
					DeathYear: req.body.DeathYear
				};

				var bookSql = {
					BookTitle: req.body.BookTitle,
					OriginalTitle: req.body.OriginalTitle,
					YearofPublication: req.body.YearofPublication,
					Genre: req.body.Genre,
					MillionsSold: req.body.MillionsSold,
					LanguageWritten: req.body.LanguageWritten,
					coverImagePath: req.body.coverImagePath
				};

				var bookPlotSql = {
					Plot: req.body.Plot,
					PlotSource: req.body.PlotSource,
				};

				// Author
				var insertAuthor = `INSERT INTO author (Name, Surname, Nationality, BirthYear, DeathYear) VALUES (?,?,?,?,?)`;

				conn.query(insertAuthor, [authorSql.Name, authorSql.Surname, authorSql.Nationality, authorSql.BirthYear, authorSql.DeathYear], function (err, res, fields) {
					if (err) {
						return conn.rollback(function () {
							throw err;
						});
					}
					console.log(err);
					console.log(`Author inserted with ID: ${fields.InsertId}`)

					// Book
					var insertBook = `INSERT INTO book (BookTitle, OriginalTitle, YearofPublication, Genre, MillionsSold, LanguageWritten, AuthorID, coverImagePath) VALUES (?,?,?,?,?,?,?,?)`;
					conn.query(insertBook, [bookSql.BookTitle, bookSql.OriginalTitle, bookSql.YearofPublication, bookSql.Genre, bookSql.MillionsSold, bookSql.LanguageWritten, fields.InsertId, bookSql.coverImagePath], function (err, res, fields) {
						if (err) {
							return conn.rollback(function () {
								throw err;
							});

						}
						console.log(err);
						console.log(`Book inserted with ID: ${fields.InsertId}`)

						// Book Plot
						var insertBookPlot = `INSERT INTO bookplot (Plot, PlotSource, BookID) VALUES (?,?,?)`;

						conn.query(insertBookPlot, [bookPlotSql.Plot, bookPlotSql.PlotSource, fields.insertId], function (err, res, fields) {
							if (err) {
								return conn.rollback(function () {
									throw err;
								});
							}
							console.log(err);
							console.log(`BookPlot inserted with ID: ${fields.InsertId}`)

							conn.commit(function (err) {
								if (err) {
									return conn.rollback(function () {
										throw err;
									});
								}


								console.log('Transaction Complete! $$$');
								console.log(err);
								res.redirect('books');
							});
						});
					});
				});
			});
		})
	})

	//////////////////////////////////////////////////////////////////
	// USERS
	//////////////////////////////////////////////////////////////////

	// @route  GET /users
	// @desc   View all user accounts
	// @access Private
	app.get('/users', isLoggedIn, (req, res) => {
		let sql = 'SELECT * FROM login';
		connection.query(sql, (err, result, fields) => {
			if (err) throw err;
			res.render('users', {
				result,
				table: 'users',
				message: req.flash('signupMessage')
			});
		});
	});

	// Delete user
	app.post('/deleteUser', (req, res) => {
		let sql = `DELETE FROM login where loginID = ${req.body.delete}`;
		connection.query(sql, (err, result, fields) => {
			if (err) throw err;
			console.log(`Deleted User with ID: ${req.body.delete}`)
			let refresh = 'SELECT * FROM login';
			connection.query(refresh, (err, result, fields) => {
				if (err) throw err;
				res.redirect('users')
			});
		});
	});

	// Update user
	app.post('/updateUser', (req, res) => {
		let sql = `UPDATE login SET username = '${req.body.username}', accessRights = '${req.body.accessRights}' where loginID = '${req.body.update}'`;
		connection.query(sql, (err, result, fields) => {
			if (err) throw err;
			console.log(`Updated User with ID: ${req.body.update}`)
			let refresh = 'SELECT * FROM login';
			connection.query(refresh, (err, result, fields) => {
				if (err) throw err;
				res.redirect('users')
			});
		});
	});

	// ADD USER
	app.post('/addUser', isLoggedIn, (req, res, next) => {
		connection.query("SELECT * FROM login WHERE username = ?", [req.body.username], function (err, rows) {
			if (err)
				return next(err);

			if (rows.length) {
				return next(null, false, req.flash('signupMessage', 'That username is already taken.'));
			} else {
				// if there is no user with that username
				// create the user
				var newUserMysql = {
					username: req.body.username,
					password: bcrypt.hashSync(req.body.password, null, null),
					accessRights: req.body.accessRights
				};

				var insertQuery = "INSERT INTO login ( username, password, accessRights ) VALUES (?, ?, ?)";
				connection.query(insertQuery, [newUserMysql.username, newUserMysql.password, newUserMysql.accessRights], function (err, rows) {
					console.log('New user created')
					newUserMysql.loginID = rows.insertId;
					res.redirect('users');
				});
			}
		});
	});

	//////////////////////////////////////////////////////////////////
	// BOOKS
	//////////////////////////////////////////////////////////////////

	// Check user login status
	function isLoggedIn(req, res, next) {

		// If logged in, continue...
		if (req.isAuthenticated())
			return next();

		// Else redirect home
		res.redirect('/');
	}


}