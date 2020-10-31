const express = require('express'),
    expressLayouts = require('express-ejs-layouts'),
    session = require('express-session'),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    db = require('./config/db'),
    app = express();

// Connect database
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySQL Connected...')
});

app.use(bodyParser.urlencoded({
    extended: true
}));

//EJS
app.use(expressLayouts);
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));
app.set('view engine', 'ejs');

// Landing/Login
app.get('/', (req, res) => {
    let sql = 'SELECT * FROM book, author, bookplot';
    db.query(sql, (err, result, fields) => {
        if (err) throw err;
        res.render('login', { result });
        console.log(`Login ${Object.keys(result)}`)
    });
});

// Dashboard
app.get('/dashboard', (req, res) => {
    let sql = 'SELECT * FROM book, author, bookplot, changelog, users, login';
    db.query(sql, (err, result, fields) => {
        if (err) throw err;
        res.render('dashboard', { result });
        console.log(`Dashboard ${Object.keys(result)}`)
    });
});

// Get all from Books
app.get('/books', (req, res) => {
    let sql = 'SELECT * FROM book, bookplot WHERE bookplot.BookID = book.BookID';
    db.query(sql, (err, result, fields) => {

        if (err) {
            res.render('books', { result });
            console.log(`Books ${Object.keys(result)}`)
            console.log(`Body1: ${req.body}`)
        }
        res.render('books', { result });
        console.log(`Books ${Object.keys(result)}`)
        console.log(`Body2: ${req.body.Object}`)
    });
});

// Get all from Authors
app.get('/authors', (req, res) => {
    let sql = 'SELECT * FROM book, author, bookplot, changelog, users, login';
    db.query(sql, (err, result, fields) => {
        if (err) throw err;
        res.render('authors', { result });
        console.log(`Authors ${Object.keys(result)}`)
    });
});

// Return all tables
app.get('/return', (req, res) => {
    let sql = 'SELECT TOP 0 * FROM books';
    db.query(sql, (err, result, fields) => {
        if (err) throw err;
        res.render('books', { result });
        console.log(`All results ${Object.keys(result)}`)
    });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on ${PORT}`));
