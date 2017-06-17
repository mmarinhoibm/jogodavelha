var express = require('express');
var sessions = require ('express-session');
var bodyParser = require('body-parser');
var EventEmitter = require("events").EventEmitter;
var gamecontrol = require('./game-control.js');

var waitplayer_res
var waitmove_res;
var game_event = new EventEmitter();
var port = (process.env.PORT || 3000);
var app = express();

app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());
app.use(sessions({ secret : 'this should not be here', resave : true, saveUninitialized : true}));

// Access the session as req.session
app.get('/session', function(req, res, next) {
  var sess = req.session
  if (sess.views) {
    sess.views++
    res.setHeader('Content-Type', 'text/html')
    res.write('<p>views: ' + sess.views + '</p>')
    res.write('<p>expires in: ' + (sess.cookie.maxAge / 1000) + 's</p>')
    res.end()
  } else {
    sess.views = 1
    res.end('welcome to the session demo. refresh!')
  }
});

// receive a move from a player
app.post('/move', function (req,res){
  console.log('move: '+ req.body.pos+req.body.player+req.body.count,req.body.control_id);
  var err = gamecontrol.move( { game_key : req.body.game_key, pos : req.body.pos, count : req.body.count, player : req.body.player, ui_control : req.body.control_id });
  res.append('Content-Type', 'application/json');
  if (err) res.status(400).send({ error : err });
  else res.status(200).send(gamecontrol.getGame());
  game_event.emit('move');
  res.end();
});

// wait for a new move and return game data
app.get('/move', function (req,res){
  move_res = res;
  game_event.once('move', function () {
    move_res.append('Content-Type', 'application/json');
    move_res.status(200).send(gamecontrol.getGame());
    move_res.end();
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
  res.status(200).send(JSON.stringify(gamecontrol.getGame()));
  res.end();
});

// join the game as a new player
app.post('/newplayer',function (req,res){
  console.log('newplayer: '+req.body.player_name);
  var gamedata = gamecontrol.newPlayer({ name : req.body.player_name});
  req.session.gamedata = gamedata;
  game_event.emit('newplayer');
  res.status(200).send(gamedata);
  res.end();
});

// wait for other player to join the game
app.get('/waitplayer', function (req,res){
  if (gamecontrol.getGame().playerO_name.length >  0){
    res.status(200).send('Game started.');
    res.end();
  } else {
    waitplayer_res = res;
    game_event.once('newplayer', function () {
      waitplayer_res.status(200).send('Game started.');
      waitplayer_res.end();
    });
  }
});

app.use(express.static('HTML'));
app.listen(port, function () {
  console.log('Example app listening on '+ port);
});
