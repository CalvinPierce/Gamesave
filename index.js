var express = require('express')
const axios = require('axios')
const { api_info } = require('./config.js')

var token = api_info.TOKEN;
var user_key = api_info.KEY;
var host = api_info.HOST;
var host_key = api_info.HOST_KEY;

var app = express()

app.use(express.static("public"))
app.set('view engine', 'ejs');

app.route('/')
.get((req, res) => {
    res.render('index')
})

app.route('/login')
.get((req, res) => {
    res.render('login')
})
  
app.route('/test')
.get((req, res) => {
    var options = {
        method: 'GET',
        url: 'https://cheapshark-game-deals.p.rapidapi.com/deals',
        params: {
          title: 'fallout new vegas',
          output: 'json',
          sortBy: 'Store',
          pageSize: '60',
          storeID: '1,4,5,8,13,25'
        },
        headers: {
            host: token,
            'x-rapidapi-key': user_key
        }
      };
      
      axios.request(options).then(function (result) {
          res.render('test', {
              items: result.data
          });
      }).catch(function (error) {
          console.error(error);
      });
  });

//   app.route('/test')
// .get((req, res) => {
//     axios
//       .get("https://jsonplaceholder.typicode.com/posts")
//       .then(function (result) {
//         res.render("test", {
//           items: result.data
//         });
//       })
//       .catch(function (error) {
//         // handle errors appropriately
//         res.render("error", { error });
//       });
//   });



let server = app.listen(8081, () => {
    var host = server.address().address
    var port = server.address().port

    console.log(`Server running at ${host}${port}`)
})