var gameControl;
var gameboard;
var gamedata;
var move;

gameControl.function newGame () {
  gamedata = {
    'state' : 0,
    'playerX' : '';
    'playerO' : '';
    'last' : 'O';
    'col' : -1;
    'row' : -1;
    'next' : 'X';
    'count': 0;
  }
  gameboard = [['','',''],['','',''],['','','']];
}

gameControl.function waitMove(res,req){

}

gameControl.function newPlayer(player){
  if (gamedata.playerX == '') gamedata.playerX = player;
  else (gamedata.playerO == '') gamedata.playerX = player;
  else return 'Error: already 2 players in the game.'; // Error: no space for new players

  return '';
}

gameControl.function checkMove() {
 if (gamedata.count <= 10) gamedata.move++;
 else return 'Error: more than 9 moves.';



 return '';
}
