const DEBUG = false;

const MAX_DEPTH = 4;
const Q_MULTIPLIER = 2;
const USE_Q_SEARCH = true;
const USE_HASHING = false;
const TIMEOUT = 300;
const TIME_LIMIT = 10;
const PIECE_VAL = { p: 100, n: 280, b: 320, r: 479, q: 929, k: 60000 };
const POS_VAL_W = {
    p: [
        [100, 100, 100, 100, 105, 100, 100, 100],
        [78, 83, 86, 73, 102, 82, 85, 90],
        [7, 29, 21, 44, 40, 31, 44, 7],
        [-17, 16, -2, 15, 14, 0, 15, -13],
        [-26, 3, 10, 9, 6, 1, 0, -23],
        [-22, 9, 5, -11, -10, -2, 3, -19],
        [-31, 8, -7, -37, -36, -14, 3, -31],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    n: [
        [-66, -53, -75, -75, -10, -55, -58, -70],
        [-3, -6, 100, -36, 4, 62, -4, -14],
        [10, 67, 1, 74, 73, 27, 62, -2],
        [24, 24, 45, 37, 33, 41, 25, 17],
        [-1, 5, 31, 21, 22, 35, 2, 0],
        [-18, 10, 13, 22, 18, 15, 11, -14],
        [-23, -15, 2, 0, 2, 0, -23, -20],
        [-74, -23, -26, -24, -19, -35, -22, -69],
    ],
    b: [
        [-59, -78, -82, -76, -23, -107, -37, -50],
        [-11, 20, 35, -42, -39, 31, 2, -22],
        [-9, 39, -32, 41, 52, -10, 28, -14],
        [25, 17, 20, 34, 26, 25, 15, 10],
        [13, 10, 17, 23, 17, 16, 0, 7],
        [14, 25, 24, 15, 8, 25, 20, 15],
        [19, 20, 11, 6, 7, 6, 20, 16],
        [-7, 2, -15, -12, -14, -15, -10, -10],
    ],
    r: [
        [35, 29, 33, 4, 37, 33, 56, 50],
        [55, 29, 56, 67, 55, 62, 34, 60],
        [19, 35, 28, 33, 45, 27, 25, 15],
        [0, 5, 16, 13, 18, -4, -9, -6],
        [-28, -35, -16, -21, -13, -29, -46, -30],
        [-42, -28, -42, -25, -25, -35, -26, -46],
        [-53, -38, -31, -26, -29, -43, -44, -53],
        [-30, -24, -18, 5, -2, -18, -31, -32],
    ],
    q: [
        [6, 1, -8, -104, 69, 24, 88, 26],
        [14, 32, 60, -10, 20, 76, 57, 24],
        [-2, 43, 32, 60, 72, 63, 43, 2],
        [1, -16, 22, 17, 25, 20, -13, -6],
        [-14, -15, -2, -5, -1, -10, -20, -22],
        [-30, -6, -13, -11, -16, -11, -16, -27],
        [-36, -18, 0, -19, -15, -15, -21, -38],
        [-39, -30, -31, -13, -31, -36, -34, -42],
    ],
    k: [
        [4, 54, 47, -99, -99, 60, 83, -62],
        [-32, 10, 55, 56, 56, 55, 10, 3],
        [-62, 12, -57, 44, -67, 28, 37, -31],
        [-55, 50, 11, -4, -19, 13, 0, -49],
        [-55, -43, -52, -28, -51, -47, -8, -50],
        [-47, -42, -43, -79, -64, -32, -29, -32],
        [-4, 3, -14, -50, -57, -18, 13, 4],
        [17, 30, -3, -14, 6, -1, 40, 18],
    ]
};
const POS_VAL_B = {
    p: POS_VAL_W["p"].slice().reverse(),
    n: POS_VAL_W["n"].slice().reverse(),
    b: POS_VAL_W["b"].slice().reverse(),
    r: POS_VAL_W["r"].slice().reverse(),
    q: POS_VAL_W["q"].slice().reverse(),
    k: POS_VAL_W["k"].slice().reverse()
}

var board = null;
var game = new Chess();
var states_checked = 0;
var q_states_checked = 0;
var hashes_used = 0;
var start;
var max_depth;
var black_to_move;
var randTable = [];
var hashTable = [];
var turns = 0;

function evalMove(move) {
    let turn, pst, pst_opp;
    if (move.color === "w") {
        turn = 1;
        pst = POS_VAL_W;
        pst_opp = POS_VAL_B;
    } else {
        turn = -1;
        pst = POS_VAL_B;
        pst_opp = POS_VAL_W;
    }

    let eval = 0;
    var from = [8 - parseInt(move["from"][1]), move["from"].charCodeAt(0) - "a".charCodeAt(0)];
    var to = [8 - parseInt(move["to"][1]), move["to"].charCodeAt(0) - "a".charCodeAt(0)];

    if (move.san.includes("#")) { return [Infinity * turn, move]; }
    if ("captured" in move) {
        eval += (PIECE_VAL[move.captured] + pst_opp[move.captured][to[0]][to[1]]) * turn;
    }
    if (move.san.includes("O-O")) {
        eval += 50;
    }
    if (move.flags.includes("p")) {
        eval -= (PIECE_VAL[move.piece] + pst[move.piece][from[0]][from[1]]) * turn;
        eval += (PIECE_VAL[move.promotion] + pst[move.promotion][to[0]][to[1]]) * turn;
    } else {
        // console.log(from, to);
        // console.log(pst);
        eval -= pst[move.piece][from[0]][from[1]] * turn;
        eval += pst[move.piece][to[0]][to[1]] * turn;
    }
    return [eval, move];
}

function evalPosVal(game) {
    var sum = 0;
    var pieces = game.fen().split(' ')[0].split("");
    pieces = pieces.filter((p) => p.match(/[a-z]/i));
    for (let i = 0; i < pieces.length; i++) {
        var piece = pieces[i];
        let turn = piece == piece.toLowerCase() ? -1 : 1;
        sum += PIECE_VAL[piece.toLowerCase()] * turn;
    }
    return sum;
}

function evalPos(game, move, eval) {
    if (!move) {
        return evalPosVal(game);
    }
    var turn = move.color === "w" ? 1 : -1;

    let [hashEval, hashMove] = readHash(getHash(game), Infinity);
    if (hashEval && USE_HASHING) { return [hashEval, hashMove]; }

    if (game.in_checkmate()) { return Infinity * turn; }
    if (game.in_draw()) { return 0; }
    if (game.in_check()) { eval += 25; }

    eval += evalMove(move)[0];

    return eval;
}

function sortMoves(game, moves) {
    let sortedMoves = [];
    for (var i = 0; i < moves.length; i++) {
        let move = game.move(moves[i]);
        game.undo();
        sortedMoves.push(evalMove(move));
    }

    sortedMoves.sort((p1, p2) => p2[0] - p1[0]);
    if (game.turn() === "b") { sortedMoves.reverse(); }
    // if (DEBUG) { console.log(sortedMoves); }
    sortedMoves = sortedMoves.map((p) => p[1].san);
    return sortedMoves;
}

function minimaxAlphaBeta(game, turn, depth, alpha, beta, prevMove, prevEval) {
    if ((new Date() - start) / 1000 > TIME_LIMIT) {
        return [null, null];
    }

    let [hashEval, hashMove] = readHash(getHash(game), depth);
    if (hashEval && USE_HASHING) {
        // console.log("READING HASH from Minimax");
        if (DEBUG && depth == max_depth) {
            console.log("Depth: " + max_depth);
            console.log([hashEval, hashMove.san]);
        }
        return [hashEval, hashMove];
    }

    let basicEval = evalPos(game, prevMove, prevEval);
    if (depth >= max_depth) {
        if (USE_Q_SEARCH) { return quiescenceSearch(game, turn, depth, alpha, beta, prevMove, basicEval); }
        return [basicEval, null];
    }

    states_checked++;

    // let moves = game.moves();
    let moves = sortMoves(game, game.moves());
    if (moves.length === 0) {
        writeHash(getHash(game), basicEval, prevMove, depth);
        return [basicEval, null];
    }
    // console.log(move, prevEval, depth);
    // if (DEBUG && depth === max_depth) {
    //     // console.log(game.moves());
    //     // if(prevMove) {console.log(prevMove.san);}
    //     console.log(moves);
    // }

    let eval, bestMove;
    if (depth === 0) {
        bestMove = moves[0];
    }
    let allMoves = [];
    if (turn) {
        eval = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            var move = game.move(moves[i]);
            [newEval, newMove] = minimaxAlphaBeta(game, !turn, depth + 1, alpha, beta, move, basicEval);
            game.undo();

            if (newEval === null) {
                continue;
            }

            if (DEBUG && depth === 0) {
                allMoves.push([newEval, moves[i]]);
            }

            if (!bestMove || newEval > eval) {
                eval = newEval;
                bestMove = move;
            }
            if (alpha < eval) alpha = eval;
            if (alpha >= beta) {
                writeHash(getHash(game), eval, bestMove, depth);
                break;
            }
        }
    } else {
        eval = Infinity;
        for (let i = 0; i < moves.length; i++) {
            var move = game.move(moves[i]);
            [newEval, newMove] = minimaxAlphaBeta(game, !turn, depth + 1, alpha, beta, move, basicEval);
            game.undo();

            if (newEval === null) {
                continue;
            }

            if (DEBUG && depth === 0) {
                allMoves.push([newEval, move.san]);
            }

            if (!bestMove || newEval < eval) {
                eval = newEval;
                bestMove = move;
            }
            if (beta > eval) beta = eval;
            if (alpha >= beta) {
                writeHash(getHash(game), eval, bestMove, depth);
                break;
            }
        }
    }
    if (DEBUG) {
        allMoves.sort((p1, p2) => p2[0] - p1[0]);
        if (game.turn() === "b") { allMoves.reverse() };
        // allMoves = allMoves.map((p) => p[1]);
        if (depth === 0) {
            console.log("Depth: " + max_depth);
            console.log(allMoves);
        }
    }
    writeHash(getHash(game), eval, bestMove, depth);
    return [eval, bestMove];
}

function getQMoves(game) {
    let allMoves = game.moves();
    let captures = allMoves.filter((move) => move.includes("x"));
    let checks = allMoves.filter((move) => move.includes("+"));
    let checkmates = allMoves.filter((move) => move.includes("#"));
    let promotions = allMoves.filter((move) => move.includes("="));
    return [...captures, ...checks, ...checkmates, ...promotions];
}

function quiescenceSearch(game, turn, depth, alpha, beta, prevMove, prevEval) {
    if ((new Date() - start) / 1000 > TIME_LIMIT) {
        return [null, null];
    }

    let [hashEval, hashMove] = readHash(getHash(game), depth);
    if (hashEval && USE_HASHING) {
        // console.log("READING HASH from Q-Search");
        if (DEBUG && depth == max_depth) {
            console.log("Depth: " + max_depth);
            console.log([hashEval, hashMove.san]);
        }
        return [hashEval, hashMove];
    }

    // let qmoves = getQMoves(game);
    let qmoves = sortMoves(game, getQMoves(game));
    if (qmoves.length === 0 || depth === (max_depth + 1) * Q_MULTIPLIER) {
        writeHash(getHash(game), prevEval, prevMove, depth);
        return [prevEval, null];
    }

    q_states_checked++;

    // console.log(qmoves);

    let eval, bestMove;
    if (turn) {
        eval = -Infinity;
        for (let i = 0; i < qmoves.length; i++) {
            var qmove = game.move(qmoves[i]);
            [newEval, newMove] = minimaxAlphaBeta(game, !turn, depth + 1, alpha, beta, qmove, prevEval);
            game.undo();

            if (newEval === null) {
                continue;
            }

            if (!bestMove || newEval > eval) {
                eval = newEval;
                bestMove = qmove;
            }
            if (alpha < eval) alpha = eval;
            if (alpha >= beta) {
                writeHash(getHash(game), eval, bestMove, depth);
                break;
            }
        }
        if (eval >= prevEval) {
            writeHash(getHash(game), eval, bestMove, depth);
            return [eval, bestMove];
        }
        return [prevEval, null];
    } else {
        eval = Infinity;
        for (let i = 0; i < qmoves.length; i++) {
            var qmove = game.move(qmoves[i]);
            [newEval, newMove] = minimaxAlphaBeta(game, !turn, depth + 1, alpha, beta, qmove, prevEval);
            game.undo();

            if (newEval === null) {
                continue;
            }

            if (!bestMove || newEval < eval) {
                eval = newEval;
                bestMove = qmove;
            }
            if (beta > eval) beta = eval;
            if (alpha >= beta) {
                writeHash(getHash(game), eval, bestMove, depth);
                break;
            }
        }
        if (eval <= prevEval) {
            writeHash(getHash(game), eval, bestMove, depth);
            return [eval, bestMove];
        }
        return [prevEval, null];
    }
}

function iterativeDeepening(game) {
    max_depth = 1;
    let tot_hashes_used = 0;
    let tot_states = 0;
    let tot_q_states = 0;
    let tot_time = 0;
    let bestEval;
    let bestMove;

    start = new Date();
    while (tot_time < TIME_LIMIT) {
        hashes_used = 0;
        states_checked = 0;
        q_states_checked = 0;
        let level_start = new Date();
        let [eval, move] = minimaxAlphaBeta(game, (game.turn() === "w"), 0, -Infinity, Infinity, null, 0);
        tot_time += (new Date() - level_start) / 1000;
        tot_hashes_used += hashes_used;
        tot_states += states_checked;
        tot_q_states += q_states_checked;
        if (tot_time < TIME_LIMIT) {
            bestEval = eval;
            bestMove = move;
            writeHash(getHash(game), bestEval, bestMove, max_depth);
        } else {
            break;
        }
        max_depth++;
    }
    game.move(bestMove.san);
    board.position(game.fen());

    console.log(hashTable.length);
    console.log("Eval: " + (bestEval / 100).toFixed(2));
    console.log("Depth: " + (max_depth - 1));
    console.log("Best Move: " + bestMove.san);
    console.log("Time Taken: " + tot_time.toFixed(3));
    console.log("Hashes Used: " + tot_hashes_used);
    console.log("Unique States Checked: " + tot_states);
    console.log("Unique Q-States Checked: " + tot_q_states);
    console.log("");
}

function random() {
    return Math.floor((2 ** 31) * Math.random());
}

function initZobrist() {
    for (var i = 0; i < 64; i++) {
        randTable.push([]);
        for (var j = 0; j < 12; j++) {
            randTable[i].push(random());
        }
    }
    black_to_move = random();
}

function getHash(game) {
    var piece_hash_val = { p: 0, n: 1, b: 2, r: 3, q: 4, k: 5 };
    let position = game.board();
    var h = 0;
    if (game.turn() === "b") { h ^= black_to_move; }
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            if (position[i][j]) {
                let piece_index = piece_hash_val[position[i][j].type];
                if (position[i][j].color === "w") { piece_index += 6; }
                h ^= randTable[i * 8 + j][piece_index];
            }
        }
    }
    return h;
}

function readHash(hash, depth) {
    if (USE_HASHING) {
        let position = hashTable[hash];
        if (position && position.hash === hash) {
            hashes_used++;
            if (depth <= position.depth) {
                return [position.eval, position.move];
            }
        }
    }
    return [null, null];
}

function writeHash(hash, eval, move, depth) {
    if (move && USE_HASHING) {
        hashTable[hash] = {};
        var position = hashTable[hash];
        position.hash = hash;
        position.eval = eval;
        position.move = move;
        position.depth = depth;
    }
    // console.log(position);
}



function playGame() {
    // exit if the game is over

    if (game.in_checkmate()) {
        if (game.turn() == "w") {
            console.log("Black wins!");
        } else {
            console.log("White wins!");
        }
    }
    if (game.in_draw()) {
        console.log("It's a Draw.");
    }
    if (game.game_over()) return;

    iterativeDeepening(game);

    window.setTimeout(playGame, TIMEOUT);
}

board = Chessboard("myBoard", "start");

// game.move("e4");
// game.move("e5");
// game.move("c4");
board.position(game.fen());

initZobrist();

// console.log(randTable);
// console.log(black_to_move);

window.setTimeout(playGame, TIMEOUT);