var express = require('express');
var bodyParser = require('body-parser');
var events = require('events');
//var gamecontrol = require('game-control');
var port = (process.env.PORT || 3000);

var app = express();
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());
app.post('/newplayer',function (req,res){
  console.log(req.body.player);
  res.status(200).send('X');
  res.end();
});

app.use(express.static('HTML'));

//newGame();
app.listen(port, function () {
  console.log('Example app listening on '+ port);
});
