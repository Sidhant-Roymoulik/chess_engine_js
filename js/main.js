var board = null;
var game = new Chess();
var timeout = 500;

function getCaptures(possibleMoves) {
    var captures = [];
    for (var i = 0; i < possibleMoves.length; i++) {
        if (possibleMoves[i][1] === "x") {
            captures.push(possibleMoves[i]);
        }
    }
    return captures;
}

function makeRandomMove(possibleMoves) {
    // choses a random index in the list
    var randomIdx = Math.floor(Math.random() * possibleMoves.length);

    // updates javascript board state
    game.move(possibleMoves[randomIdx]);
}

function makeCapture(possibleMoves) {
    var captures = getCaptures(possibleMoves);

    // If there are captures on the board, play a random one
    if (captures.length > 0) {
        makeRandomMove(captures);
    }
    // Otherwise play a random move
    else {
        makeRandomMove(possibleMoves);
    }
}

function playGame() {
    // exit if the game is over
    if (game.game_over()) return;

    // chess.js gives us all the possible moves in an array
    // [ move1, move2, move3 ... ]
    var possibleMoves = game.moves();

    if(game.turn() === "w") {
        // makeRandomMove(possibleMoves);
        makeCapture(possibleMoves);
    } else {
        // makeRandomMove(possibleMoves);
        makeCapture(possibleMoves);
    }

    // changes html board state
    board.position(game.fen());

    window.setTimeout(playGame, timeout);
}

board = Chessboard("myBoard", "start");

window.setTimeout(playGame, 500);
