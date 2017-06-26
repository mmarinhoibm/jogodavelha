var gamedata = {
  state : 0, //state=0: not ready to play
  last : 'O',
  next : 'X',
  count: 0,
  winner: '',
}
gamedata.board = ['','','','','','','','',''];
gamedata.game_key = new Date().getTime();
gamedata.last_move = new Date().getTime();

var p = {name : 'DAVI', symbol : 'X'};
gamedata.player['X'] = p;

console.log(gamedata.player.X.name);

console.log(JSON.stringify(gamedata));
