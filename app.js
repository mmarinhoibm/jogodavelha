var express = require('express');
var bodyParser = require('body-parser');
var events = require('events');
var gamecontrol = require('./game-control.js');

gamecontrol.newGame();

var port = (process.env.PORT || 3000);

var app = express();
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

app.get('/newgame', function (req,res){
  gamecontrol.newGame();
  res.status(200).send(gamecontrol.getGame());
  res.end();
});

app.post('/newplayer',function (req,res){

  console.log(req.body.player);
  var XO = gamecontrol.newPlayer(req.body.player);
  if (XO.length > 0) res.status(200).send(XO);
  else res.status(500).send('Jogo em andamento.');
  res.end();
});

app.use(express.static('HTML'));

//newGame();
app.listen(port, function () {
  console.log('Example app listening on '+ port);
});
