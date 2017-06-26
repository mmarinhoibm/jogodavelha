var express = require('express');
var sessions = require ('express-session');
var bodyParser = require('body-parser');
var EventEmitter = require('events').EventEmitter;
var gamecontrol = require('./game-control.js');

var waitplayer = {};
var waitmove = {};
var new_player_event = new EventEmitter();
var new_move_event = new EventEmitter();
var port = (process.env.PORT || 3000);
var app = express();

app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());
app.use(sessions({ secret : 'this should not be here', resave : true, saveUninitialized : true}));
app.use(function (req,res,next){ console.log(req.method+req.url+'\n'+req.session.game_key+'\n'+JSON.stringify(req.body));next();});

app.get('/', express.static('HTML/index.html'));
// receive a move from a player
app.post('/move', function (req,res){
  var move_obj = gamecontrol.move({
    game_key : req.session.game_key,
    pos : req.body.pos,
    count : req.body.count,
    symbol : req.body.symbol
  });
  var gamedata = gamecontrol.getGame(req.session.game_key);
  console.log('move RES: '+JSON.stringify(move_obj));
  if (move_obj.success) {
    res.status(200).json(gamedata);
    new_move_event.emit('move'+req.session.game_key);
  } else res.status(400).json(move_obj);
});

// wait for a new move and return game data
app.get('/waitmove', function (req,res){
  waitmove.res = res;
  waitmove.game_key = req.session.game_key;
  new_move_event.once('move'+waitmove.game_key, function () {
    var gamedata_obj = gamecontrol.getGame(waitmove.game_key);
    waitmove.res.json(gamedata_obj);
  });
});

// return game data after last move
// if param=true reset the game (clean players, moves, etc)
app.get('/gamedata', function (req,res){
  if (req.query.reset == 'true') gamecontrol.newGame();
  res.status(200).json(gamecontrol.getGame(req.session.game_key));
});

app.get('/player', function (req,res){
  var json_res = {
    symbol: req.session.symbol,
    player_name:req.session.player_name
  };
  console.log('GET player '+JSON.stringify(json_res));
  res.status(200).json(json_res);
});

// join the game as a new player
app.post('/player',function (req,res){
  var json_res = gamecontrol.newPlayer({ name : req.body.player_name });
  if (json_res.success) {
    req.session.game_key = json_res.game_key;
    req.session.symbol = json_res.symbol;
    req.session.player_name = req.body.player_name;
    new_player_event.emit('newplayer-'+json_res.game_key);
    res.status(200).json(json_res);
  } else res.status(400).json(json_res);
});

// wait for other player to join the game
app.get('/waitplayer', function (req,res){
  var gamedata = gamecontrol.getGame(req.session.game_key);
  console.log('wait player: '+gamedata.playerX_name+gamedata.playerO_name);
  if (gamedata.state == 1 && gamedata.playerO_name != ''){
    res.status(200).json({success : true});
  } else {
    waitplayer.res = res;
    waitplayer.session = req.session;
    new_player_event.once('newplayer-'+req.session.game_key, function () {
      var gamedata = gamecontrol.getGame(waitplayer.session.game_key);
      console.log('new player event: '+JSON.stringify(gamedata));
      if (gamedata.state == 1) waitplayer.res.status(200).json({sucess : true});
      else waitplayer.res.status(400).json({sucess:false, message :'Event newplayer but state = '+gamedata.state });
    });
  }
});

app.use(express.static('HTML'));
app.listen(port, function () {
  console.log('Example app listening on '+ port);
});
