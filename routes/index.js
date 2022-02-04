var express = require('express');
var router = express.Router();
const axios = require('axios')

const { api_info } = require('../config.js')

var token = api_info.TOKEN;
var user_key = api_info.KEY;
var host = api_info.HOST;
var host_key = api_info.HOST_KEY;

router.get('/', (req, res, next) => {
    res.render('index')
})

router.get('/login', (req, res) => {
    res.render('login')
})

router.get('/register', (req, res) => {
    res.render('register')
})

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
                  storeID: '1,4,5,8,13,25'
                },
                headers: {
                    host: token,
                    'x-rapidapi-key': user_key
                }
              };
              
              axios.request(options).then(function (result) {
                  res.render('results', {
                      items: result.data,
                      searchName:  searchTitle
                  });
              }).catch(function (error) {
                  console.error(error);
              });
          });

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