const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: [true, "Username already taken"]
  },
  email: {
    type: String,
    required: true,
    validate: function(value) {
      var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
      return emailRegex.test(value);
    }
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;