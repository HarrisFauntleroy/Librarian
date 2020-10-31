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
    res.render('index');
});

// Dashboard
app.get('/dashboard', (req, res) => {
    let sql = 'SELECT * FROM book, author, bookplot, changelog, users, login';
    db.query(sql, (err, result, fields) => {
        if (err) throw err;
    });
});

// Get all from Books
app.get('/books', (req, res) => {
    let table = 'books'
    let sql = 'SELECT * FROM book, bookplot WHERE bookplot.BookID = book.BookID';
    db.query(sql, (err, result, fields) => {
        if (err) throw err;
        res.render('books', { result, table });
    });
});

// Get all from Authors
app.get('/authors', (req, res) => {
    let table = 'authors'
    let sql = 'SELECT * FROM author';
    db.query(sql, (err, result, fields) => {
        if (err) throw err;
        res.render('authors', { result, table });
    });
});

// Get all from Users
app.get('/users', (req, res) => {
    let table = 'users'
    let sql = 'SELECT * FROM users';
    db.query(sql, (err, result, fields) => {
        if (err) throw err;
        res.render('users', { result, table });
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on ${PORT}`));