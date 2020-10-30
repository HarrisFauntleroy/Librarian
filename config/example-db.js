const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'example.org',
    user: 'username',
    password: 'password',
    database: 'databasename'
});

connection.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + connection.threadId);
});

// To use this rename the file as db.js and enter connection details