var express = require('express');
var events = require('events');
var bodyparser = require('body-parser');
var app = express();
var gamecontrol = require('game-control');
var port = (process.env.PORT || 3000);

app.use(bodyParser.urlencoded({ extended: true }));
app.post('/newplayer',function (req,res){
  console.log(req.body.name);
  var err = gameControl.newPlayer(req.body.playername);
  if (err){
    res.status(500).send(err);
  }else if (gameControl.gamedata.playerX && gameControl.gamedata.playerX)
  res.status(200).send(express.static('HTML/jogo.html');
  else res.status(200).send(express.static('HTML/wait.html'));
  res.end();
});

app.use(express.static('HTML'));

newGame();
app.listen(port, function () {
  console.log('Example app listening on '+ port);
});
