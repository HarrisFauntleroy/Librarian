//////////////////////////////////////////////////////////////////
// BOOKS
//////////////////////////////////////////////////////////////////

const express = require('express'),
    router = express.Router(),
    path = require("path"),
    util = require("util"),
    { isLoggedIn } = require('../config/auth'),
    mysql = require('mysql'),
    dbconfig = require('../config/database'),
    connection = mysql.createPool(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

// @route  GET /books
// @desc   View all books
// @access Private
router.get('/books', isLoggedIn, async (req, res) => {
    let sql = `SELECT * 
		FROM book AS b
		INNER JOIN bookplot AS bp 
		ON b.BookID = bp.BookID
		INNER JOIN author AS a 
		ON b.AuthorID = a.AuthorID`;
    connection.query(sql, (err, result, fields) => {
        if (err) throw err;
        res.render('books', {
            result,
            table: 'books',
            message: req.flash('signupMessage')
        });
    });
});

//////////////////////////////////////////////////////////////////
// DELETE BOOK !!WORKING!!
//////////////////////////////////////////////////////////////////
router.post('/deleteBook', isLoggedIn, async (req, res) => {

    var deleteBookSql = {
        BookID: req.body.delete
    }

    let sql = `DELETE FROM book where BookID = ?`;

    connection.query(sql, [deleteBookSql.BookID], (err, result, fields) => {
        if (err) throw err;
        console.log(`Deleted Book with ID: ${deleteBookSql.BookID}`)
        let refresh = `SELECT * 
		FROM book AS b
		INNER JOIN bookplot AS bp 
		ON b.BookID = bp.BookID
		INNER JOIN author AS a 
		ON b.AuthorID = a.AuthorID`;
        connection.query(refresh, (err, result, fields) => {
            if (err) throw err;
            res.redirect('books')
        });
    });
});

//////////////////////////////////////////////////////////////////
// UPDATE BOOK !!
//////////////////////////////////////////////////////////////////
router.post('/updateBook', isLoggedIn, async (req, res) => {
    try {
        const file = req.files.file;
        const fileName = file.name;
        const size = file.data.length;
        const extension = path.extname(fileName);

        const allowedExtensions = /png|jpeg|jpg|gif/;

        if (!allowedExtensions.test(extension)) throw "Unsupported extension!";
        if (size > 5000000) throw "File must be less than 5MB";

        const md5 = file.md5;
        const URL = "/covers/" + md5 + extension;

        var coverImagePath = URL;

        await util.promisify(file.mv)("./public" + URL);
        console.log(`Image uploaded to ${coverImagePath}`)

    } catch (err) {
        console.log(err);
        var coverImagePath = req.body.defaultFile;
    }

    // Start connection
    connection.getConnection(function (err, conn) {

        // Start transaction
        conn.beginTransaction(function (err) {

            var updateAuthorSql = Object.assign({
                Name: req.body.Name,
                Surname: req.body.Surname,
                Nationality: req.body.Nationality,
                BirthYear: req.body.BirthYear,
                AuthorID: req.body.AuthorID
            },
                req.body.DeathYear !== '' ? { DeathYear: req.body.DeathYear } : null
            )

            var updateBookSql = Object.assign({
                BookTitle: req.body.BookTitle,
                OriginalTitle: req.body.OriginalTitle,
                YearofPublication: req.body.YearofPublication,
                Genre: req.body.Genre,
                MillionsSold: req.body.MillionsSold,
                LanguageWritten: req.body.LanguageWritten,
                BookID: req.body.BookID
            },
                coverImagePath !== '' ? { coverImagePath: coverImagePath } : null
            );

            var updateBookPlotSql = {
                Plot: req.body.Plot,
                PlotSource: req.body.PlotSource,
                BookPlotID: req.body.BookPlotID
            };

            // Author
            var updateAuthor = `UPDATE author SET Name=?, Surname=?, Nationality=?, BirthYear=?, DeathYear=? WHERE AuthorID = ?`;

            conn.query(updateAuthor, [updateAuthorSql.Name, updateAuthorSql.Surname, updateAuthorSql.Nationality, updateAuthorSql.BirthYear, updateAuthorSql.DeathYear, updateAuthorSql.AuthorID], function (err, res) {
                if (err) {
                    return conn.rollback(function () {
                        throw err;
                    });
                }
                (err != null) ? console.log(err) : console.log(`Author inserted`);

                // Book
                var updateBook = `UPDATE book SET BookTitle=?, OriginalTitle=?, YearofPublication=?, Genre=?, MillionsSold=?, LanguageWritten=?, coverImagePath=? WHERE BookID = ?`;
                conn.query(updateBook, [updateBookSql.BookTitle, updateBookSql.OriginalTitle, updateBookSql.YearofPublication, updateBookSql.Genre, updateBookSql.MillionsSold, updateBookSql.LanguageWritten, updateBookSql.coverImagePath, updateBookSql.BookID], function (err, res) {
                    if (err) {
                        return conn.rollback(function () {
                            throw err;
                        });

                    }
                    (err != null) ? console.log(err) : console.log(`Book inserted`);

                    // Book Plot
                    var updateBookPlot = `UPDATE bookplot SET Plot=?, PlotSource=? WHERE BookPlotID = ?`;

                    conn.query(updateBookPlot, [updateBookPlotSql.Plot, updateBookPlotSql.PlotSource, updateBookPlotSql.BookPlotID], function (err, res) {
                        if (err) {
                            return conn.rollback(function () {
                                throw err;
                            });
                        }
                        (err != null) ? console.log(err) : console.log(`Book Plot inserted`);

                        // Commit transaction
                        conn.commit(function (err) {
                            if (err) {
                                return conn.rollback(function () {
                                    throw err;
                                });
                            }
                            (err != null) ? console.log(err) : console.log('Transaction Complete! $$$');
                        });
                    });
                });
            });
        });
        res.redirect('books')
    })
});

//////////////////////////////////////////////////////////////////
// ADD BOOK !!WORKING!!
//////////////////////////////////////////////////////////////////
router.post('/addBook', isLoggedIn, async (req, res) => {

    try {
        const file = req.files.file;
        const fileName = file.name;
        const size = file.data.length;
        const extension = path.extname(fileName);

        const allowedExtensions = /png|jpeg|jpg|gif/;

        if (!allowedExtensions.test(extension)) throw "Unsupported extension!";
        if (size > 5000000) throw "File must be less than 5MB";

        const md5 = file.md5;
        const URL = "/covers/" + md5 + extension;

        var coverImagePath = URL;

        await util.promisify(file.mv)("./public" + URL);
        console.log(`Image uploaded to ${coverImagePath}`)

    } catch (err) {
        console.log(err);
    }

    // Start connection
    connection.getConnection(function (err, conn) {

        // Start transaction
        conn.beginTransaction(function (err) {

            var authorSql = Object.assign({
                Name: req.body.Name,
                Surname: req.body.Surname,
                Nationality: req.body.Nationality,
                BirthYear: req.body.BirthYear,
            },
                req.body.DeathYear !== '' ? { DeathYear: req.body.DeathYear } : null
            )

            var bookSql = Object.assign({
                BookTitle: req.body.BookTitle,
                OriginalTitle: req.body.OriginalTitle,
                YearofPublication: req.body.YearofPublication,
                Genre: req.body.Genre,
                MillionsSold: req.body.MillionsSold,
                LanguageWritten: req.body.LanguageWritten,
            },
                coverImagePath !== '' ? { coverImagePath: coverImagePath } : null
            );

            var bookPlotSql = {
                Plot: req.body.Plot,
                PlotSource: req.body.PlotSource,
            };

            // Author
            var insertAuthor = `INSERT IGNORE INTO author (Name, Surname, Nationality, BirthYear, DeathYear) VALUES (?,?,?,?,?)`;

            conn.query(insertAuthor, [authorSql.Name, authorSql.Surname, authorSql.Nationality, authorSql.BirthYear, authorSql.DeathYear], function (err, res) {
                if (err) {
                    return conn.rollback(function () {
                        throw err;
                    });
                }
                authorSql.AuthorID = res.insertId;
                (err != null) ? console.log(err) : console.log(`Author inserted`);

                // Book
                var insertBook = `INSERT INTO book (BookTitle, OriginalTitle, YearofPublication, Genre, MillionsSold, LanguageWritten, AuthorID, coverImagePath) VALUES (?,?,?,?,?,?,?,?)`;
                conn.query(insertBook, [bookSql.BookTitle, bookSql.OriginalTitle, bookSql.YearofPublication, bookSql.Genre, bookSql.MillionsSold, bookSql.LanguageWritten, authorSql.AuthorID, bookSql.coverImagePath], function (err, res) {
                    if (err) {
                        return conn.rollback(function () {
                            throw err;
                        });

                    }
                    bookSql.BookID = res.insertId;
                    (err != null) ? console.log(err) : console.log(`Book inserted`);

                    // Book Plot
                    var insertBookPlot = `INSERT INTO bookplot (Plot, PlotSource, BookID) VALUES (?,?,?)`;

                    conn.query(insertBookPlot, [bookPlotSql.Plot, bookPlotSql.PlotSource, bookSql.BookID], function (err, res) {
                        if (err) {
                            return conn.rollback(function () {
                                throw err;
                            });
                        }
                        bookPlotSql.BookPlotID = res.insertId;
                        (err != null) ? console.log(err) : console.log(`Book Plot inserted`);

                        // Commit transaction
                        conn.commit(function (err) {
                            if (err) {
                                return conn.rollback(function () {
                                    throw err;
                                });
                            }
                            (err != null) ? console.log(err) : console.log('Transaction Complete! $$$');
                        });
                    });
                });
            });
        });
        res.redirect('books')
    })
});

module.exports = router;