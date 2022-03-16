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
const Epic = require('../models/Epic')
const Steam = require('../models/Steam')

const bcrypt = require("bcryptjs");
const passport = require("passport");

var token = api_info.TOKEN;
var user_key = api_info.KEY;
var host = api_info.HOST;
var host_key = api_info.HOST_KEY;

router.get('/', (req, res, next) => {
    getIndexGames().then(result => {
        //getSteamFeatured()
        res.render('index', {
            items: result.freeNow,
            future: result.freeNext,
            steam: result.games,
            login: req.isAuthenticated()
        })
    })
})



// updates for grabbing user liked games data from index page

router.post('/', checkAuthenticated, async (req, res) => {
    //const liked = {gamename: gamename, price: price, retailer: retailer, username: username};
    //console.log(liked);
    //const username = await User.findById(req.user.username);
    
    if(req.body.retailer == "Steam"){
        try{
            const steam = new Steam({
                gamename: req.body.gamename,
                regular_price: req.body.regular_price,
                sale_price: req.body.sale_price,
                platform: req.body.platform,
                buy_now: req.body.buy_now,
                image: req.body.image,
                steam_id: req.body.steam_id,
                username: req.user.username
            });
            await steam.save();
            //res.redirect("/");
            console.log(steam);
            console.log('Steam game added to database');
            } catch(error) {
            console.log('Steam game not added')
        }
    }else{
        try {
            const game = new Epic({
                gamename: req.body.gamename,
                regular_price: req.body.regular_price,
                sale_price: req.body.sale_price,
                retailer: req.body.retailer,
                buy_now: req.body.buy_now,
                image: req.body.image,
                epic_id: req.body.epic_id,
                username: req.user.username
            });
            await game.save();
            //res.redirect("/");
            console.log(game);
    
        } catch (error) {
            console.log(error);
            //res.redirect("/");
        }
    }
});



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
    res.render('search')
})

router.post('/result', (req, res) => {
    var searchTitle = req.body.game
    var options = {
        method: 'GET',
        url: 'https://cheapshark-game-deals.p.rapidapi.com/deals',
        params: {
            lowerPrice: '-1',
            title: searchTitle,
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
            searchName: searchTitle
        });
    }).catch(function (error) {
        console.error(error);
    });
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
                freeNow = element
            } else {
                freeNext = element
            }
        }
    })
    console.log(freeNext)
    //freeNow = data.data.data.Catalog.searchStore.elements[0]
    //freeNext = data.data.data.Catalog.searchStore.elements[1]
    //console.log(freeNow)
    //console.log(freeNext)
    return { freeNow, freeNext }
}

const getSteamFeatured = async () => {
    let games = []
    const data = await axios.get(
        'https://store.steampowered.com/api/featuredcategories?cc=ca'
    );
    games = data.data.specials.items
    console.log(games)
    return { games }
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
    //console.log(data.data.data.Catalog.searchStore.elements)
    data.data.data.Catalog.searchStore.elements.forEach((element) => {
        if (element.promotions) {
            if (element.promotions.promotionalOffers.length != 0) {
                freeNow.push(element)
            } else {
                freeNext.push(element)
            }
        }
    })
    //console.log(freeNow)
    games = steam.data.specials.items
    return { games, freeNow, freeNext }
}

// router.get('/test', async (req, res) => {
//     getFreeGames().then(result => {
//         //console.log(result.freeNow)
//         res.render('test', {
//             items: result.freeNow,
//             future: result.freeNext
//         })
//     })
// })

// router.get('/test', async (req, res) => {
//     // getSteamFeatured().then(result => {
//     //     res.render('test', {
//     //         items: result.games
//     //     })
//     // })
//     let games = []
//     getSteamFeatured().then(result => {
//         // res.render('test', {
//         //     items: result.games
//         // })
//         //console.log(result.games)
//         games = result.games
//     })
//     console.log(games)
//     //res.render('test')
// });

router.get('/edit-profile', (req, res) => {
    res.render('edit-profile')
})




// updates for grabbing user liked games data from database to profile page


router.get('/profile', checkAuthenticated, (req, res, next) => {
    const getLikedGames = async () => {

        let epicgames = await Epic.find({ username: req.body.username })
        let steamgames = await Steam.find({ username: req.body.username })
    
        return { epicgames, steamgames }
    }
    getLikedGames().then(result => {
        res.render('profile', {
            username: req.user.username,
            epicgames: result.epicgames,
            steamgames: result.steamgames
        })
    })
})

router.delete("/unlike", (req, res) => {
    req.unlike();
    res.redirect("/profile");
});



router.get('/reset-password/:userId/:token', (req, res) => {
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
        if (!token){
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
    res.render('reset-password')
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
    res.render('request-reset-password')
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

// app.route('/login')
// .get((req, res) => {
//     res.render('login')
// })

// app.route('/test')
// .get((req, res) => {
//     var options = {
//         method: 'GET',
//         url: 'https://cheapshark-game-deals.p.rapidapi.com/deals',
//         params: {
//           title: 'fallout new vegas',
//           output: 'json',
//           sortBy: 'Store',
//           pageSize: '60',
//           storeID: '1,4,5,8,13,25'
//         },
//         headers: {
//             host: token,
//             'x-rapidapi-key': user_key
//         }
//       };

//       axios.request(options).then(function (result) {
//           res.render('test', {
//               items: result.data
//           });
//       }).catch(function (error) {
//           console.error(error);
//       });
//   });


// router.get('/test', (req, res) => {
//         var options = {
//             method: 'GET',
//             url: 'https://cheapshark-game-deals.p.rapidapi.com/deals',
//             params: {
//               title: 'fallout new vegas',
//               output: 'json',
//               sortBy: 'Store',
//               pageSize: '60',
//               storeID: '1,4,5,8,13,25'
//             },
//             headers: {
//                 host: token,
//                 'x-rapidapi-key': user_key
//             }
//           };

//           axios.request(options).then(function (result) {
//               res.render('test', {
//                   items: result.data
//               });
//           }).catch(function (error) {
//               console.error(error);
//           });
//       });

module.exports = router;