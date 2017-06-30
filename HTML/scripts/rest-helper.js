function Game(){
  var self = this;
  this.gamedata = {};

  this.onGameError = function (e){  console.log('Game error: '+e);  }
  this.onMoveError = function (e){  console.log('Move error: '+e);  }
  this.onloadMove = function () { console.log(JSON.stringify(gamedata));}
  this.onloadGame = function () { console.log(JSON.stringify(gamedata));}

  this.loadGame = function () {
    var req = new XMLHttpRequest();
    req.open('GET', '/gamedata', true);
    req.onerror = function (e) { self.onMoveError(e) };
    req.onload = function (e) {
      if (req.status == 200) {
        self.gamedata = JSON.parse(req.responseText);
        self.onloadGame();
      } else self.onMoveError(e);
    }
    req.send();
  }

  this.onNextMove = function () {
    console.log('onloadNextMove');
  }

  this.waitNextMove = function () {
    var req = new XMLHttpRequest();
    req.open('GET', '/waitmove', true);
    req.onerror = function (e) { self.onMoveError(e) };
    req.onload = function (e) {
      if (req.status == 200) {
        self.gamedata = JSON.parse(req.responseText);
        self.onNextMove();
      } else self.onMoveError (e);
    }
    req.send();
  }

  this.onNewMove = function () {
    console.log('onNewMove');
  }

  this.newMove = function (move){
    var req = new XMLHttpRequest();
    req.open('POST', '/move', true);
    req.onerror = function (e) { self.onMoveError(e) };
    req.onload = function (e) {
      if (req.status == 200) {
        self.gamedata = JSON.parse(req.responseText);
        self.onNewMove();
      } else self.onMoveError (req.responseText);
    }
    req.setRequestHeader('Content-Type','application/json;charset=UTF-8');
    req.send(JSON.stringify(move));
  }
}

function Player (){
  var self = this;
  this.player_name = '';
  this.symbol = '';

  this.onPlayerError = function (e){  console.log('Player error: '+e);  }
  this.onloadPlayer = function () { console.log(player_name + ' ' + symbol);}

  this.loadPlayer = function () {
    var req = new XMLHttpRequest();
    req.open('GET', '/player', true);
    req.onerror = function (e) { self.onPlayerError(e) };
    req.onload = function (e) {
      if (req.status == 200) {
        var player_obj = JSON.parse(req.responseText);
        self.player_name = player_obj.player_name;
        self.symbol = player_obj.symbol;
        self.onloadPlayer();
      } else self.onPlayerError(e);
    }
    req.send();
  }

  this.onNextPlayer = function () {
    console.log('onloadNextPlayer');
  }

  this.waitNextPlayer = function () {
    var req = new XMLHttpRequest();
    req.open('GET', '/waitplayer', true);
    req.onerror = function (e) { self.onPlayerError(e) };
    req.onload = function (e) {
      if (req.status == 200) self.onNextPlayer();
      else self.onPlayerError (e);
    }
    req.send();
  }

  this.onNewPlayer = function () {
    console.log('onNewPlayer');
  }

  this.newPlayer = function (name){
    var req = new XMLHttpRequest();
    req.open('POST', '/player', true);
    req.onerror = function (e) { self.onPlayerError(e) };
    req.onload = function (e) {
      if (req.status == 200) {
        var newplayer = JSON.parse(req.responseText);
        self.player_name = newplayer.player_name;
        self.symbol = newplayer.symbol;
        self.onNewPlayer();
      } else self.onPlayerError (req.responseText);
    }
    req.setRequestHeader('Content-Type','application/json;charset=UTF-8');
    req.send(JSON.stringify({ 'player_name' : name }));
  }
}
