const TIMEOUT = 300;
const MAX_DEPTH = 3;

const PIECE_VAL = {p : 100, n : 290, b : 310, r : 500, q : 900, k : 100000};

var board = null;
var game = new Chess();
var states_checked = 0;

function evalPosVal(game) {
    var sum = 0;
    var pieces = game.fen().split(' ')[0].split("");
    pieces = pieces.filter((p) => p.match(/[a-z]/i));
    for(let i = 0; i < pieces.length; i++) {
        var piece = pieces[i];
        piece == piece.toLowerCase() ? sum -= PIECE_VAL[piece] : sum += PIECE_VAL[piece.toLowerCase()];
    }
    return sum;
}

function evalPos(game, move) {
    let turn = (game.turn() === "w") ? 1 : -1;
    let eval = evalPosVal(game);
    if(!move) {
        if(game.in_checkmate()) {return -Infinity * turn;}
        if(game.in_draw()) {return 0;}
        return eval;
    }
    
    if(move.includes("#")) {return Infinity * turn;}
    if(move.includes("+")) {eval += 25;}
    if(move.includes("=")) {
        eval += PIECE_VAL[move.promotion] * turn;
        eval -= PIECE_VAL[move.piece] * turn;
    }
    return eval;
}

function minimaxAlphaBeta(game, depth, alpha, beta, move) {
    states_checked++;
    if(depth <= 0) {
        return [evalPos(game), null];
    }

    let eval = evalPos(game, move), bestMove = null;
    var moves = game.moves();
    if(game.turn() === "w") {
        eval = -Infinity;
        for(let i = 0; i < moves.length; i++) {
            game.move(moves[i]);
            [newEval, newMove] = minimaxAlphaBeta(game, depth-1, alpha, beta, moves[i]);
            game.undo();

            if(newEval > eval) {
                eval = newEval;
                bestMove = moves[i];
            }
            beta = (beta < eval) ? eval : beta;
            if(beta >= alpha) {
                break;
            }
        }
    } else {
        eval = Infinity;
        for(let i = 0; i < moves.length; i++) {
            game.move(moves[i]);
            [newEval, newMove] = minimaxAlphaBeta(game, depth-1, alpha, beta, moves[i]);
            game.undo();
            
            if(newEval < eval) {
                eval = newEval;
                bestMove = moves[i];
            }
            alpha = (alpha > eval) ? eval : alpha;
            if(beta >= alpha) {
                break;
            }
        }
    }
    return [eval, bestMove];
}

function evaluate(depth) {
    let start = new Date();
    states_checked = 0;
    [eval, move] = minimaxAlphaBeta(game, depth, Infinity, -Infinity, null);
    if(!move) {
        return;
    }
    game.move(move);
    board.position(game.fen());
    let end = new Date();

    console.log("Eval: " + eval/100);
    console.log("Best Move: " + move);
    console.log("Time Taken: " + (end - start)/1000);
    console.log("States Checked: " + states_checked);
    console.log("");
}

function playGame() {
    // exit if the game is over
    if (game.game_over()) return;

    game.move("d4");
    game.move("d5");
    game.move("c4");

    evaluate(MAX_DEPTH);

    window.setTimeout(playGame, TIMEOUT);
}

board = Chessboard("myBoard", "start");
window.setTimeout(playGame, TIMEOUT);