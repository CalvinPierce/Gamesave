const mongoose = require("mongoose");
var passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: false,
    unique: [true, "Username already taken"]
  },
  email: {
    type: String,
    required: false,
    validate: function(value) {
      var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
      return emailRegex.test(value);
    }
  },
  password: {
    type: String,
    required: false,
  },
  type: {
    type: String,
    enum: ['admin', 'customer'],
    default: 'customer'
  },
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);
module.exports = User;