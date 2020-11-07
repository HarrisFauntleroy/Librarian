const express = require('express'),
	router = express.Router(),
	{ isLoggedIn } = require('../config/auth'),
	mysql = require('mysql'),
	passport = require('passport'),
	dbconfig = require('../config/database'),
	connection = mysql.createPool(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

//////////////////////////////////////////////////////////////////
// LOGIN / LOGOUT
//////////////////////////////////////////////////////////////////

// @route  GET /

// @desc   Login page
// @access Public
router.get('/', async (req, res) => {
	res.render('index', {
		layout: false,
		message: req.flash('loginMessage')
	});
});

// @route  GET /logout
// @desc   Logout page
// @access Private
router.get('/logout', isLoggedIn, async (req, res) => {
	req.logout();
	res.redirect('/');
});

// @route  GET /profile
// @desc   View logged in user profile
// @access Private
router.get('/profile', isLoggedIn, async (req, res) => {
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
router.post('/login', passport.authenticate('local-login', {
	successRedirect: '/profile',
	failureRedirect: '/',
	failureFlash: true
}),
	async (req, res) => {
		if (req.body.remember) {
			req.session.cookie.maxAge = 1000 * 60 * 3;
		} else {
			req.session.cookie.expires = false;
		}
		res.redirect('/');
	});

module.exports = router;