const { urlencoded } = require("express");
const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user",
    },
    gameId: {
        type: String,
        required: true,
    },
    gameTitle: {
        type: String,
        required: true,
    }
});

const Like = mongoose.model("Like", likeSchema);
module.exports = Like;