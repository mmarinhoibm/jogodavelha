var express = require('express');
var sessions = require ('express-session');
var bodyParser = require('body-parser');
var EventEmitter = require('events').EventEmitter;
var gamecontrol = require('./game-control.js');

var waitplayer = {};
var waitmove = {};
var game_event = new EventEmitter();
var port = (process.env.PORT || 3000);
var app = express();

app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());
app.use(sessions({ secret : 'this should not be here', resave : true, saveUninitialized : true}));

// receive a move from a player
app.post('/move', function (req,res){
  console.log('move: '+ req.body.pos+req.body.symbol+req.body.count,req.body.control_id);
  var json_move = gamecontrol.move( {
    game_key : req.session.game_key,
    pos : req.body.pos,
    count : req.body.count,
    symbol : req.body.symbol,
    ui_control : req.body.control_id
  });
  res.append('Content-Type', 'application/json');
  if (json_move.success) {
    res.status(200).send(json_move);
    game_event.emit('move');
  }
  else res.status(400).send(json_move);
  res.end();
});

// wait for a new move and return game data
app.get('/move', function (req,res){
  waitmove.res = res;
  waitmove.session = req.session;
  game_event.once('move', function () {
    var json_move = gamecontrol.getGame(waitmove.session.game_key);
    waitmove.res.append('Content-Type', 'application/json');
    waitmove.res.status(200).send(json_move);
    waitmove.res.end();
  })
});

// return game data after last move
// if param=true reset the game (clean players, moves, etc)
app.get('/gamedata', function (req,res){
  console.log(req.query.reset);
  if (req.query.reset == 'true'){
    gamecontrol.newGame();
    game_event.removeAllListeners();
  }
  res.append('Content-Type', 'application/json');
  var json_str = JSON.stringify(gamecontrol.getGame(req.session.game_key));
  console.log(json_str);
  res.status(200).send(json_str);
  res.end();
});

app.get('/player', function (req,res){
  var json_res = {
    symbol: req.session.symbol,
    player_name:req.session.player_name
  };
  console.log('GET player '+JSON.stringify(json_res));
  res.status(200).send(json_res);
  res.end();
});

// join the game as a new player
app.post('/player',function (req,res){
  console.log('POST player: '+req.body.player_name);
  var json_res = gamecontrol.newPlayer({ name : req.body.player_name });
  if (json_res.success) {
    req.session.game_key = json_res.game_key;
    req.session.symbol = json_res.symbol;
    req.session.player_name = req.body.player_name;
    game_event.emit('newplayer');
    res.status(200).send(json_res);
  } else res.status(400).send(json_res); // send error
  res.end();
});

// wait for other player to join the game
app.get('/waitplayer', function (req,res){
  console.log('wait player: '+req.session.game_key);
  if (gamecontrol.getGame(req.session.game_key).state == 1){
    res.status(200).send({sucess : true});
    res.end();
  } else {
    waitplayer.res = res;
    waitplayer.session = req.session;
    game_event.once('newplayer', function () {
      var gamedata = gamecontrol.getGame(waitplayer.session.game_key);
      console.log('new player event: '+JSON.stringify(gamedata));
      if (gamedata.state == 1) waitplayer.res.status(200).send('Game started.');
      else waitplayer.res.status(400).send('Event NewPlayer but state != 1');
      waitplayer.res.end();
    });
  }
});

app.use(express.static('HTML'));
app.listen(port, function () {
  console.log('Example app listening on '+ port);
});
