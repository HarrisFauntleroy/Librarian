const express = require('express');
const db = require('./config/db')

const app = express();

// Connect database
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySQL Connected...')
});


// Get Books
app.get('/books', (req, res) => {
    let sql = 'SELECT BookTitle FROM book';
    db.query(sql, (err, result, fields) => {
        if (err) throw err;
        res.send(result);
    });
});

// Get Authors
app.get('/authors', (req, res) => {
    let sql = 'SELECT Name FROM author';
    db.query(sql, (err, result, fields) => {
        if (err) throw err;
        res.send(result);
    });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on ${PORT}`));
