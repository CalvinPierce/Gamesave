const { urlencoded } = require("express");
const mongoose = require("mongoose");
var passportLocalMongoose = require('passport-local-mongoose');

const steamSchema = new mongoose.Schema({
    gamename: {
        gamename_one: { type: String },
        gamename_two: { type: String },
        gamename_three: { type: String },
        gamename_four: { type: String },
        gamename_five: { type: String },
        gamename_six: { type: String },
        gamename_seven: { type: String },
        gamename_eight: { type: String },
        gamename_nine: { type: String },
        gamename_ten: { type: String }
    },
    regular_price: {
        regular_price_one: { type: String },
        regular_price_two: { type: String },
        regular_price_three: { type: String },
        regular_price_four: { type: String },
        regular_price_five: { type: String },
        regular_price_six: { type: String },
        regular_price_seven: { type: String },
        regular_price_eight: { type: String },
        regular_price_nine: { type: String },
        regular_price_ten: { type: String }
    },
    sale_price: {
        sale_price_one: { type: String },
        sale_price_two: { type: String },
        sale_price_three: { type: String },
        sale_price_four: { type: String },
        sale_price_five: { type: String },
        sale_price_six: { type: String },
        sale_price_seven: { type: String },
        sale_price_eight: { type: String },
        sale_price_nine: { type: String },
        sale_price_ten: { type: String }
    },
    platform: {
        platform_one: { type: String },
        platform_two: { type: String },
        platform_three: { type: String },
        platform_four: { type: String },
        platform_five: { type: String },
        platform_six: { type: String },
        platform_seven: { type: String },
        platform_eight: { type: String },
        platform_nine: { type: String },
        platform_ten: { type: String }
    },
    buy_now: {
        buy_now_one: { type: String },
        buy_now_two: { type: String },
        buy_now_three: { type: String },
        buy_now_four: { type: String },
        buy_now_five: { type: String },
        buy_now_six: { type: String },
        buy_now_seven: { type: String },
        buy_now_eight: { type: String },
        buy_now_nine: { type: String },
        buy_now_ten: { type: String }
    },
    image: {
        image_one: { type: String },
        image_two: { type: String },
        image_three: { type: String },
        image_four: { type: String },
        image_five: { type: String },
        image_six: { type: String },
        image_seven: { type: String },
        image_eight: { type: String },
        image_nine: { type: String },
        image_ten: { type: String }
    },
    steam_id: {
        steam_id_one: { type: String },
        steam_id_two: { type: String },
        steam_id_three: { type: String },
        steam_id_four: { type: String },
        steam_id_five: { type: String },
        steam_id_six: { type: String },
        steam_id_seven: { type: String },
        steam_id_eight: { type: String },
        steam_id_nine: { type: String },
        steam_id_ten: { type: String }
    },
    username: {
        type: String,
        required: true,
        trim: true
    }
});

steamSchema.plugin(passportLocalMongoose);

const Steam = mongoose.model("Steam", steamSchema);
module.exports = Steam;