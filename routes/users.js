//////////////////////////////////////////////////////////////////
// USERS
//////////////////////////////////////////////////////////////////

const express = require('express'),
    router = express.Router(),
    { isLoggedIn } = require('../config/auth'),
    mysql = require('mysql'),
    bcrypt = require('bcrypt-nodejs'),
    dbconfig = require('../config/database'),
    connection = mysql.createPool(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

// @route  GET /users
// @desc   View all user accounts
// @access Private
router.get('/users', isLoggedIn, async (req, res) => {
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

//////////////////////////////////////////////////////////////////
// DELETE USER
//////////////////////////////////////////////////////////////////
router.post('/deleteUser', async (req, res) => {
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

//////////////////////////////////////////////////////////////////
// UPDATE USER
//////////////////////////////////////////////////////////////////
router.post('/updateUser', async (req, res) => {
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

//////////////////////////////////////////////////////////////////
// ADD USER
//////////////////////////////////////////////////////////////////
router.post('/addUser', isLoggedIn, async (req, res, next) => {
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
            connection.query(insertQuery, [newUserMysql.username, newUserMysql.password, newUserMysql.accessRights], function (err, fields) {
                console.log('New user created')
                newUserMysql.loginID = fields.insertId;
                res.redirect('users');
            });
        }
    });
});

module.exports = router;