var gameboard = [];
var move;
var gamedata = {};

exports.getGame = function (){
  return gamedata;
}

exports.newGame = function () {
  gameboard = [['','',''],['','',''],['','','']];

  gamedata = {
    'state' : 0,
    'playerX' : '',
    'playerO' : '',
    'last' : 'O',
    'col' : -1,
    'row' : -1,
    'next' : 'X',
    'count': 0
  }
  return gamedata;
}

exports.newPlayer = function (name){
  var r = '';
  if (gamedata.playerX == '') {
    gamedata.playerX = name;
    r = 'X';
  }
  else if (gamedata.playerO == '') {
    gamedata.playerO = name;
    r = 'O';
  }
  return r;
}

exports.checkMove - function () {
  if (gamedata.count <= 10) gamedata.move++;
  else return 'Error: more than 9 moves.';

  return '';
}
