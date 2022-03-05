var express = require('express');
var router = express.Router();
const axios = require('axios')

const { api_info } = require('../config.js');
const { response } = require('express');

const {
    checkAuthenticated,
    checkNotAuthenticated,
} = require("../auth");
const User = require('../models/User')
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

router.get('/profile', checkAuthenticated, (req, res) => {
    res.render('profile', { username: req.user.username })
})

router.get('/reset-password', (req, res) => {
    res.render('reset-password')
})

router.get('/request-reset-password', (req, res) => {
    res.render('request-reset-password')
})

router.get('/change-password', (req, res) => {
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