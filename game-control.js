var gamedata_map = new Map();
var pre_game = false;

// remove games not played for more than 10 minutes
setTimeout (function () {
  var timeout = (new Date().getTime()) - (10*60*1000); // ten minutes ago
  for (var game_key of gamedata_map.keys())
    if (gamedata_map.get(game_key).last_move < timeout){
      console.log('delete: '+ JSON.stringify(gamedata_map.get(game_key)));
      gamedata_map.delete(game_key);
    }
}, (30*60*1000)); // wait 30 minutes and running it again

exports.getGame = function (game_key){
  return gamedata_map.get(game_key);
}

exports.newGame = function () {
  var gamedata = {
    state : 0, //state=0: not ready to play
    playerX_name : '',
    playerO_name : '',
    last : 'O',
    pos: 0,
    next : 'X',
    count: 0,
    winner: '',
    ui_control : '',
  }
  gamedata.board = ['','','','','','','','',''];
  gamedata.last_move = new Date.getTime();
  gamedata.game_key = new Date.getTime();
  gamedata_map.set(gamedata.game_key, gamedata);

  return gamedata;
}

exports.newPlayer = function (player){
  var game_key = 0;
  if (!pre_game) {
    pre_game = newGame();
    pre_game.playerX_name = player.name;
    game_key = pre_game.game_key;
  } else {
    game_key = pre_game.game_key;
    pre_game.playerO_name = player.name;
    pre_game.state = 1; // state=1: ready to play
    pre_game = false;
  }
  return gamedata_map.get(game_key);
}

exports.move = function (move) {
  // check move data for inconsistences
  var gamedata = gamedata_map.get(move.game_key);
  var gameboard = gamedata.board;
  var winner = false;

  gamedata.last_move = new Date.getTime();

  if (gamedata.count > 9) return 'Error: more than 9 moves.';
  else if (move.count+1 != gamedata.count ) return 'Error: should be '+gamedata.count+'moves.';
  else if (gameboard[pos] != '') return 'Error: position already played';
  else if (gamedata.next != move.player) return 'Error: should be player '+gamedata.next;
  else if (gamedata.state != 1) return 'Error: Wrong game state: '+gamedata.state;

  // move is ok
  else {
    gameboard[move.pos] = move.player;
    gamedata.next = gamedata.last;
    gamedata.last = move.player;
    gamedata.ui_control = move.control_id;
    gamedata.count++;
  }

  // check gamedata.board for winner or a tie
  // verticals and horizontals
  for (var l = 0; l < 3 && !winner; l++)
  if (gameboard[l] != '' && gameboard[l] == gameboard[l+3] && gameboard[l] == gameboard[l+6] && !winner) winner = gameboard[l];
  else if (gameboard[l*3] != '' && gameboard[l*3] == gameboard[l*3+1] && gameboard[l*3] == gameboard[l*3+2] && !winner) winner = gameboard[l];

  // diagonals
  if (gameboard[0] != '' && gameboard[0] == gameboard[4] && gameboard[0] == gameboard[8] && !winner) winner = gameboard[0];
  else if (gameboard[2] != '' && gameboard[2] == gameboard[4] && gameboard[2] == gameboard[3] && !winner) winner = gameboard[2];

  if (winner) {
    gamedata.state = 2; // finished with a winner
    gamedata.winner = winner;
  }
  else if (gamedata.count == 9){
    gamedata.state = 3;  // it is a tie
    gamedata.winner =  'Nobody.';
  }

  return false;
}
