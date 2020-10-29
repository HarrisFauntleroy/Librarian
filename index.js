const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const methodOverride = require("method-override");
const { ensureAuthenticated } = require('./config/auth');
const db = require('./config/db')

const app = express();

// Connect database
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySQL Connected...')
});

// Express Sessions middleware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

//EJS
app.use(expressLayouts);
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));
app.set('view engine', 'ejs');

// Get all from Books
app.get('/', (req, res) => {
    let sql = 'SELECT * FROM book';
    db.query(sql, (err, result, fields) => {
        if (err) throw err;
        res.render('index', { result });
        console.log(Object.keys(result))
    });
});

// Get all from Books
app.get('/addcolumn', (req, res) => {
    let sql = 'ALTER TABLE book ADD coverImagePath BLOB';
    db.query(sql, (err, result, fields) => {
        if (err) throw err;
        res.send(result);
    });
});

// Get all from Authors
app.get('/authors', (req, res) => {
    let sql = 'SELECT * FROM author';
    db.query(sql, (err, result, fields) => {
        if (err) throw err;
        res.send(result);
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on ${PORT}`));
