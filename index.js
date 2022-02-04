var express = require('express')

var indexRouter = require('./routes/index');

var app = express()

app.use(express.static("public"))
app.set('view engine', 'ejs');

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: false }));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());
app.use('/', indexRouter); //Non-user controller

let server = app.listen(8081, () => {
    var host = server.address().address
    var port = server.address().port

    console.log(`Server running at ${host}${port}`)
})