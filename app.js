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
  var move_obj = gamecontrol.move( {
    game_key : req.session.game_key,
    pos : req.body.pos,
    count : req.body.count,
    symbol : req.body.symbol,
    ui_control : req.body.control_id
  });
  res.append('Content-Type', 'application/json');
  if (move_obj.success) {
    res.status(200).send(move_obj);
    game_event.emit('move-'+req.session.game_key);
  }
  else res.status(400).send(move_obj);
  res.end();
});

// wait for a new move and return game data
app.get('/move', function (req,res){
  waitmove.res = res;
  waitmove.session = req.session;
  game_event.once('move-'+req.session.game_key, function () {
    var move_obj = gamecontrol.getGame(waitmove.session.game_key);
    console.log('GET move res: '+JSON.stringify(move_obj));
    waitmove.res.append('Content-Type', 'application/json');
    waitmove.res.status(200).send(move_obj);
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
    game_event.emit('newplayer-'+json_res.game_key);
    res.status(200).send(json_res);
  } else res.status(400).send(json_res); // send error
  res.end();
});

// wait for other player to join the game
app.get('/waitplayer', function (req,res){
  var gamedata = gamecontrol.getGame(req.session.game_key);
  console.log('wait player: '+gamedata.playerX_name+gamedata.playerO_name);
  if (gamedata.state == 1 && gamedata.playerO_name != ''){
    res.status(200).send({sucess : true});
    res.end();
  } else {
    waitplayer.res = res;
    waitplayer.session = req.session;
    game_event.once('newplayer-'+req.session.game_key, function () {
      var gamedata = gamecontrol.getGame(waitplayer.session.game_key);
      console.log('new player event: '+JSON.stringify(gamedata));
      if (gamedata.state == 1) waitplayer.res.status(200).send('Game started.');
      else waitplayer.res.status(400).send('Event newplayer but state != 1');
      waitplayer.res.end();
    });
  }
});

app.use(express.static('HTML'));
app.listen(port, function () {
  console.log('Example app listening on '+ port);
});
