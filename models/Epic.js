const { urlencoded } = require("express");
const mongoose = require("mongoose");
var passportLocalMongoose = require('passport-local-mongoose');

const epicSchema = new mongoose.Schema({
    gamename: {
        type: String,
        required: true
    },
    regular_price: {
        type: String,
        required: true
    },
    sale_price: {
        type: String,
        required: true
    },
    retailer: {
        type: String,
        required: true
    },
    buy_now:{
        type: String,
        required: false
    },
    image:{
        type: String,
        required: false
    },
    epic_id: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        trim: true
    }
});

epicSchema.plugin(passportLocalMongoose);

const Epic = mongoose.model("Epic", epicSchema);
module.exports = Epic;