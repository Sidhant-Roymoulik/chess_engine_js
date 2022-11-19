const TIMEOUT = 300;
const MAX_DEPTH = 3;

const PIECE_VAL = {p : 100, n : 300, b : 300, r : 500, q : 900, k : 100000};

var board = null;
var game = new Chess();
var states_checked = 0;

function evalPosVal(game) {
    var sum = 0;
    var pieces = game.fen().split(' ')[0].split("");
    pieces = pieces.filter((p) => p.match(/[a-z]/i));
    for(let i = 0; i < pieces.length; i++) {
        var piece = pieces[i];
        piece == piece.toLowerCase() ?sum -= PIECE_VAL[piece] : sum += PIECE_VAL[piece.toLowerCase()];
    }
    return sum;
}

function evalPos(game) {
    eval = evalPosVal(game);
    let turn = (game.turn() === "w") ? 1 : -1;
    if(game.in_checkmate()) {return Infinity*turn};
    if(game.in_draw()) {return 0;}
    if(game.in_check()) {eval += 25 * turn;}
    return eval;
}

function minimax(game, depth) {
    states_checked++;
    if(depth <= 0) {
        return [evalPos(game), null];
    }

    let eval = evalPos(game), bestMove;
    var moves = game.moves();
    if(game.turn() === "w") {
        eval = -Infinity;
        for(let i = 0; i < moves.length; i++) {
            game.move(moves[i]);
            [newEval, newMove] = minimax(game, depth-1);
            game.undo();

            if(newEval > eval) {
                eval = newEval;
                bestMove = moves[i];
            }
        }
    } else {
        eval = Infinity;
        for(let i = 0; i < moves.length; i++) {
            game.move(moves[i]);
            [newEval, newMove] = minimax(game, depth-1);
            game.undo();
            
            if(newEval < eval) {
                eval = newEval;
                bestMove = moves[i];
            }
        }
    }
    return [eval, bestMove];
}

function makeRandomMove(moves) {
    game.move(moves[Math.floor(Math.random()*moves.length)]);
}

function makeCapture(moves) {
    var captures = moves.filter((move) => move.includes("x"));
    captures.length > 0 ? makeRandomMove(captures) : makeRandomMove(moves);
}

function playGame() {
    // exit if the game is over
    if (game.game_over()) return;

    game.move("e4");
    game.move("e5");
    board.position(game.fen());

    states_checked = 0;
    [eval, move] = minimax(game, MAX_DEPTH, 0);
    game.move(move);

    console.log("Eval: " + eval);
    console.log("Move: " + move);
    console.log("States Checked: " + states_checked);

    board.position(game.fen());
    window.setTimeout(playGame, TIMEOUT);
}

board = Chessboard("myBoard", "start");
window.setTimeout(playGame, TIMEOUT);