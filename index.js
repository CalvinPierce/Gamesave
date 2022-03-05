require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const User = require("./models/User");
const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("./auth");
const indexRouter = require('./routes/index');

var app = express()

const initializePassport = require("./passport-config");
initializePassport(
  passport,
  async (email) => {
    const userFound = await User.findOne({ email });
    return userFound;
  },
  async (id) => {
    const userFound = await User.findOne({ _id: id });
    return userFound;
  }
);

app.set('view engine', 'ejs');

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.use(express.static("public"))
app.use('/', indexRouter); // Controller

//mongoDB Atlas Connection String
const mongodb_atlas_url = process.env.MONGODB_URL;

mongoose
  .connect(mongodb_atlas_url, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    app.listen(8081, () => {   
        console.log(`Server running at port 8081`)
    });
  });

// let server = app.listen(8081, () => {
//     var host = server.address().address
//     var port = server.address().port

//     console.log(`Server running at ${host}${port}`)
// })