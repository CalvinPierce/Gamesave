var express = require('express');
var router = express.Router();
const axios = require('axios')
const Token = require("../models/Token");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

const { api_info } = require('../config.js');
const { response } = require('express');


const {
    checkAuthenticated,
    checkNotAuthenticated,
} = require("../auth");
const User = require('../models/User')
const Like = require('../models/Like')

const bcrypt = require("bcryptjs");
const passport = require("passport");

var token = api_info.TOKEN;
var user_key = api_info.KEY;
var host = api_info.HOST;
var host_key = api_info.HOST_KEY;

router.get('/', (req, res) => { //Home page
    getIndexGames().then(result => { //Calls the function to retrieve epic free games and steam featured games
        res.render('index', {
            items: result.freeNow, //loads to ejs under items variable
            future: result.freeNext,
            steam: result.games,
            login: req.isAuthenticated() //checks if user is logged in and store it under login variable
        })
    })
})

router.get('/login', (req, res) => {
    res.render('login')
})

router.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/profile", 
    failureRedirect: "/login",
    failureFlash: true,
})
);

router.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register')
})

router.post("/register", checkNotAuthenticated, async (req, res) => {
    const userFoundEmail = await User.findOne({ email: req.body.email });
    const userFoundUsername = await User.findOne({ username: req.body.username });

    if (userFoundEmail || userFoundUsername) {
        req.flash("error", "User with that email or username already exists");
        res.redirect("/register");
    } else {
        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const user = new User({
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword,
            });
            await user.save();
            res.redirect("/login");
        } catch (error) {
            console.log(error);
            res.redirect("/register");
        }
    }
});

router.delete("/logout", (req, res) => {
    req.logOut();
    res.redirect("/");
});  

router.get('/search', (req, res) => {
    res.render('search', { login: req.isAuthenticated() })
})

router.post('/result', (req, res) => {
    var searchTitle = req.body.game
    var options = {
        method: 'GET',
        url: 'https://cheapshark-game-deals.p.rapidapi.com/deals',
        params: {
            lowerPrice: '-1',
            title: searchTitle, //Search api based on given title from user
            output: 'json',
            sortBy: 'Price',
            pageSize: '60',
            storeID: '1,4,5,8,13,25,31'
        },
        headers: {
            host: token,
            'x-rapidapi-key': user_key
        }
    };

    axios.request(options).then(function (result) {
        res.render('results', {
            items: result.data,
            searchName: searchTitle,
            login: req.isAuthenticated()
        });
    }).catch(function (error) {
        console.error(error);
    });
});

router.post('/like', checkAuthenticated, async (req, res) => {
    const newLike = new Like({
        userId: req.user._id,
        gameId: req.body.gameID,
        gameTitle: req.body.gameTitle
    })
    await newLike.save()
    req.flash("success", "Game added to likes");
    res.redirect("/profile");
});

const getFreeGames = async () => {
    let freeNow = []
    let freeNext = []
    const data = await axios.get(
        `https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?country=CA`
    );
    data.data.data.Catalog.searchStore.elements.forEach((element) => {
        if (element.promotions) {
            if (element.promotions.promotionalOffers.length != 0) {
                freeNow.push(element)
            } else {
                freeNext.push(element)
            }
        }
    })
    return { freeNow, freeNext }
}

const getIndexGames = async () => {
    let games = []
    let freeNow = []
    let freeNext = []
    const steam = await axios.get(
        'https://store.steampowered.com/api/featuredcategories?cc=ca'
    );

    const data = await axios.get(
        `https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?country=CA`
    );
    data.data.data.Catalog.searchStore.elements.forEach((element) => {
        if (element.promotions) {
            if (element.promotions.promotionalOffers.length != 0) {
                freeNow.push(element)
            } else {
                freeNext.push(element)
            }
        }
    })
    games = steam.data.specials.items
    return { games, freeNow, freeNext }
}

router.get('/free-games', (req, res) => {
    getFreeGames().then(result => {
        res.render('free-games', {
            items: result.freeNow,
            future: result.freeNext,
            login: req.isAuthenticated()
        })
    })
})

router.get('/edit-profile', checkAuthenticated, async (req, res) => {
    const user = await User.findById(req.user._id)
    res.render('edit-profile', { username: user.username, email: user.email })
})

router.post('/edit-profile', checkAuthenticated, async (req, res) => {
    let user = await User.findById(req.user._id);
    if(req.body.email == null || req.body.email == ""){
        user.email = user.email;
    } else {
        user.email = req.body.email;
    }
    if(req.body.username == null || req.body.username == ""){
        user.username = user.username
    } else {
        user.username = req.body.username;
    }
    await user.save();
    req.flash("success", "Profile information updated")
    res.redirect("/profile");
})

router.get('/profile', checkAuthenticated, async (req, res, next) => {
    const user = await User.findById(req.user._id); //Grabs the current user from the database
    let likedgames = await Like.find({ userId: user._id }) //Grabs the users liked games
    let gameIds = []
    for (let game of likedgames){
        gameIds.push(game.gameId) //Stores all the users liked games game ids in an array
    }
    let ids = gameIds.join() //Puts the game ids into a comma seperated string
    let data = [];

    // Queries the API based upon the games the user has liked
    var options = {
        method: 'GET',
        url: 'https://cheapshark-game-deals.p.rapidapi.com/games',
        params: {ids: ids},
        headers: {
            host: token,
            'x-rapidapi-key': user_key
        }
      };
      
      axios.request(options).then(function (result) {
          for (let id of gameIds){
            data.push(result.data[id]) //Stores the response in an array for templare iteration
          }
          res.render('profile', {
            items: data,
            username: req.user.username,
            login: req.isAuthenticated()
        });
      }).catch(function (error) {
          console.error(error);
      });
})

router.post("/unlike", async (req, res) => {
    let like = await Like.deleteOne({ "gameTitle": req.body.like_title }) //Removes the liked game from the database
    req.flash("success", "Game removed from likes");
    res.redirect("/profile");
});

router.get('/reset-password/:userId/:token', (req, res) => {
    if(req.isAuthenticated()){
        req.logOut();
    }
    res.render('reset-password', { userId: req.params.userId, token: req.params.token })
})

router.post('/reset-password', async (req, res) => {
    const user = await User.findById(req.body.userId);
    if (!user) {
        req.flash("error", "User cannot be found");
        res.redirect("/request-reset-password");
    } else {
        const token = await Token.findOne({
            userId: user._id,
            token: req.body.token,
        });
        if (!token){ //Token expires after 1 hour
            req.flash("error", "Password reset expired please send new email");
            res.redirect("/request-reset-password");
        } else {
            if(req.body.password === req.body.confirmpassword){ 
                const hashedPassword = await bcrypt.hash(req.body.password, 10); 
                user.password = hashedPassword;
                await user.save();
                req.flash("success", "Password changed successfully. Please login");
                res.redirect("/login")
            } else {
                req.flash("error", "Passwords do not match! Please send new password reset email");
                res.redirect("/request-reset-password");
            }
        }
    }
})

router.get('/request-reset-password', (req, res) => {
    res.render('request-reset-password')
})

router.post('/request-reset-password', async (req, res) => {
    const userFoundEmail = await User.findOne({ email: req.body.email });
    if (!userFoundEmail) {
        req.flash("error", "User with that email cannot be found or doesn't exist.");
        res.redirect("/request-reset-password");
    } else {
        let token = await Token.findOne({ userId: userFoundEmail._id });
        if (!token) {
            token = await new Token({
                userId: userFoundEmail._id,
                token: crypto.randomBytes(32).toString("hex"),
            }).save();
        }

        const link = `${process.env.BASE_URL}/reset-password/${userFoundEmail._id}/${token.token}`;
        await sendEmail(userFoundEmail.email, "Password reset", link);
        req.flash("success", "Password reset link sent to your email.");
        res.redirect("/request-reset-password");
    }
})

router.post('/change-password', checkAuthenticated, async (req, res) => {
    let userFound = await User.findById(req.user._id);

    if (!userFound) {
        req.flash("error", "User not found");
        res.redirect("/login");
    } else {
        try {
            if(req.body.password === req.body.confirmpassword){ 
                const hashedPassword = await bcrypt.hash(req.body.password, 10); 
                userFound.password = hashedPassword;
                await userFound.save();
                req.flash("success", "Password changed successfully!");
                res.redirect("/profile")
            } else {
                req.flash("error", "Passwords do not match!");
                res.redirect("/change-password");
            }
        } catch (error) {
            console.log(error);
            res.redirect("/change-password");
        }
    }
})

router.get('/change-password', checkAuthenticated, async (req, res) => {
    res.render('change-password')
})

module.exports = router;