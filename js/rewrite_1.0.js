// Useful constants
const PIECE_VAL = { p: 100, n: 280, b: 320, r: 479, q: 929, k: 60000 };
const PST_W = {
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
const PST_B = {
    p: PST_W["p"].slice().reverse(),
    n: PST_W["n"].slice().reverse(),
    b: PST_W["b"].slice().reverse(),
    r: PST_W["r"].slice().reverse(),
    q: PST_W["q"].slice().reverse(),
    k: PST_W["k"].slice().reverse()
}

// Debug
const DEBUG = true;

// Parameters
const TIME_LIMIT = 5; // Time in sec, set to 0 for no time limit
const MAX_CONST_DEPTH = 3;

// Strategies
const MOVE_ORDERING = true;
const ALPHA_BETA_PRUNING = true;
const QUIESCENCE_SEARCH = false;
const ITERATIVE_DEEPENING = false;
const TRANSPOSITION_TABLE = false;

// Log all strategies used in engine
var upgrades = "";
if (MOVE_ORDERING) { upgrades += " | Move Ordering"; }
if (ALPHA_BETA_PRUNING) { upgrades += " | Alpha-Beta Pruning"; }
if (QUIESCENCE_SEARCH) { upgrades += " | Q-Search"; }
if (ITERATIVE_DEEPENING) { upgrades += " | Iterative Deepening"; }
if (TRANSPOSITION_TABLE) { upgrades += " | Transposition Table"; }

if(upgrades === "") {upgrades = " | Plain"}
console.log("Engine" + upgrades)

// Globals
var chess = null;
var game = new Chess();
var hashes = 0;
var states = 0;
var q_states = 0;
var start = 0;


// ---------------------------------------------------------------------------------------
// EVALUATION FUNCTIONS
// ---------------------------------------------------------------------------------------

// Evaluate single move
function getMoveDelta(move) {
    // Set turn and the piece square tables based on the color of the move
    let turn, pst, pst_opp;
    if (move.color === "w") {
        turn = 1;
        pst = PST_W;
        pst_opp = PST_B;
    } else {
        turn = -1;
        pst = PST_B;
        pst_opp = PST_W;
    }

    // Convert squares (ex: "f6") to indices (ex: [2, 5])
    var from = [8 - parseInt(move["from"][1]), move["from"].charCodeAt(0) - "a".charCodeAt(0)];
    var to = [8 - parseInt(move["to"][1]), move["to"].charCodeAt(0) - "a".charCodeAt(0)];

    let delta = 0;

    // Check if move is checkmate
    if (move.san.includes("#")) { return [Infinity * turn, move]; }

    // Check if the move is a capture
    if ("captured" in move) { delta += (PIECE_VAL[move.captured] + pst_opp[move.captured][to[0]][to[1]]) * turn; }

    // Check if move is a castle
    if (move.san.includes("O-O")) { delta += 50; }

    // Check if a move is a promotion
    if (move.flags.includes("p")) {
        // If it's a promotion move, update eval based on new piece type and position
        delta -= (PIECE_VAL[move.piece] + pst[move.piece][from[0]][from[1]]) * turn;
        delta += (PIECE_VAL[move.promotion] + pst[move.promotion][to[0]][to[1]]) * turn;
    } else {
        // If it's a non-promotion move, update eval based on new position
        delta -= pst[move.piece][from[0]][from[1]] * turn;
        delta += pst[move.piece][to[0]][to[1]] * turn;
    }

    return delta;
}

// Evaluate piece value delta
function getBoardDelta(game) {
    var delta = 0;
    let board = game.board();
    // Iterate through all 64 squares
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            var position = board[i][j];
            if (position) {
                // + piece value + position of piece: if piece is white
                // - piece value - position of piece: if piece is black
                if (position.color === "w") {
                    delta += PIECE_VAL[position.type] + PST_W[position.type][i][j];
                } else {
                    delta -= PIECE_VAL[position.type] + PST_B[position.type][i][j];
                }
            }
        }
    }
    return delta;
}

// Evaluate end node position
function evalPos(game) {
    // The previous player caused this board state
    // Make sure to flip the turn (Used "b" instead of "w")
    let turn = game.turn() === "b" ? 1 : -1;

    // Check game over conditions
    if (game.in_checkmate()) { return Infinity * turn; }
    if (game.in_draw()) { return 0; }

    // Get piece value delta
    var newEval = getBoardDelta(game);
    // Give a little bonus if last move was a check
    if (game.in_check()) { newEval += 50 * turn; }

    return newEval;
}

// ---------------------------------------------------------------------------------------
// MOVE ORDERING FUNCTIONS
// ---------------------------------------------------------------------------------------

// Basic Move Ordering
function basicMoveSorting(game, moves) {
    let sortedMoves = [];
    for (var i = 0; i < moves.length; i++) {
        let move = game.move(moves[i]);
        game.undo();
        sortedMoves.push([getMoveDelta(move), move]);
    }

    sortedMoves.sort((p1, p2) => p2[0] - p1[0]);
    if (game.turn() === "b") { sortedMoves.reverse(); }
    // if (DEBUG) { console.log(sortedMoves); }
    sortedMoves = sortedMoves.map((p) => p[1].san);
    return sortedMoves;
}

// ---------------------------------------------------------------------------------------
// MINIMAX FUNCTIONS
// ---------------------------------------------------------------------------------------

// Plain Minimax
function minimax(game, turn, prev_eval, cur_move, ply) {
    // Check if time is up
    if (TIME_LIMIT && (new Date() - start) > TIME_LIMIT * 1000) {
        return [null, null];
    }

    states++;

    var basic_eval = evalPos(game);
    if (cur_move) { basic_eval += getMoveDelta(cur_move); }

    // Check if at maximum depth
    if (ply === MAX_CONST_DEPTH) { return [basic_eval, null] };

    // Get chosen order of moves
    var moves = MOVE_ORDERING ? basicMoveSorting(game, game.moves()) : game.moves();

    // Perform DFS on all available moves
    var best_eval, best_move;
    if (DEBUG) { var allEvals = []; }
    if (turn) {
        best_eval = -Infinity;
        for (var i = 0; i < moves.length; i++) {
            // Simulate move and get all move metadata
            var move = game.move(moves[i]);

            // DFS time
            var [new_eval, new_move] = minimax(game, !turn, basic_eval, move, ply + 1);

            // Revert game state
            game.undo();

            // Record the eval and move for debugging
            if (DEBUG && ply === 0) {
                allEvals.push([new_eval, moves[i]]);
            }

            // Update best move if calculated evaluation is higher than current evaluation
            if (new_eval >= best_eval) {
                best_eval = new_eval;
                best_move = move;
            }
        }
    } else {
        best_eval = Infinity;
        for (var i = 0; i < moves.length; i++) {
            // Simulate move and get all move metadata
            var move = game.move(moves[i]);

            // DFS time
            var [new_eval, new_move] = minimax(game, !turn, basic_eval, move, ply + 1);

            // Revert game state
            game.undo();

            // Record the eval and move for debugging
            if (DEBUG && ply === 0) {
                allEvals.push([new_eval, moves[i]]);
            }

            // Update best move if calculated evaluation is lower than current evaluation
            if (new_eval <= best_eval) {
                best_eval = new_eval;
                best_move = move;
            }
        }
    }
    if (DEBUG && ply === 0) {
        allEvals.sort((p1, p2) => p2[0] - p1[0]);
        if (!turn) { allEvals.reverse(); }
        console.log(allEvals);
    }
    return [best_eval, best_move];
}

// Minimax + Alpha-Beta Pruning
function minimaxAlphaBeta(game, turn, prev_eval, cur_move, ply, alpha, beta) {
    // Check if time is up
    if (TIME_LIMIT && (new Date() - start) > TIME_LIMIT * 1000) {
        return [null, null];
    }

    states++;

    var basic_eval = evalPos(game);
    if (cur_move) { basic_eval += getMoveDelta(cur_move); }

    // Check if at maximum depth
    if (ply === MAX_CONST_DEPTH) { return [basic_eval, null] };

    // Get chosen order of moves
    var moves = MOVE_ORDERING ? basicMoveSorting(game, game.moves()) : game.moves();

    // Perform DFS on all available moves
    var best_eval, best_move;
    if (DEBUG) { var allEvals = []; }
    if (turn) {
        best_eval = -Infinity;
        for (var i = 0; i < moves.length; i++) {
            // Simulate move and get all move metadata
            var move = game.move(moves[i]);

            // DFS time
            var [new_eval, new_move] = minimaxAlphaBeta(game, !turn, basic_eval, move, ply + 1, alpha, beta);

            // Revert game state
            game.undo();

            // Record the eval and move for debugging
            if (DEBUG && ply === 0) {
                allEvals.push([new_eval, moves[i]]);
            }

            // Update best move if calculated evaluation is higher than current evaluation
            if (new_eval >= best_eval) {
                best_eval = new_eval;
                best_move = move;
            }

            // Update alpha (Lower bound)
            if (alpha < eval) alpha = eval;
            if (alpha >= beta) {
                break;
            }
        }
    } else {
        best_eval = Infinity;
        for (var i = 0; i < moves.length; i++) {
            // Simulate move and get all move metadata
            var move = game.move(moves[i]);

            // DFS time
            var [new_eval, new_move] = minimaxAlphaBeta(game, !turn, basic_eval, move, ply + 1, alpha, beta);

            // Revert game state
            game.undo();

            // Record the eval and move for debugging
            if (DEBUG && ply === 0) {
                allEvals.push([new_eval, moves[i]]);
            }

            // Update best move if calculated evaluation is lower than current evaluation
            if (new_eval <= best_eval) {
                best_eval = new_eval;
                best_move = move;
            }

            // Update beta (Upper bound)
            if (beta > eval) beta = eval;
            if (alpha >= beta) {
                break;
            }
        }
    }
    if (DEBUG && ply === 0) {
        allEvals.sort((p1, p2) => p2[0] - p1[0]);
        if (!turn) { allEvals.reverse(); }
        console.log(allEvals);
    }
    return [best_eval, best_move];
}

// ---------------------------------------------------------------------------------------
// Q-SEARCH
// ---------------------------------------------------------------------------------------

// Get Q-Moves
function getQMoves() { }

// Plain Q-Search
function qSearch() { }

// Q-Search + Alpha-Beta Pruning
function qSearchAlphaBeta() { }

// ---------------------------------------------------------------------------------------
// Transposition / Hashing Tables
// ---------------------------------------------------------------------------------------

// Setup 64 x 12 array of random numbers
function randomize() { }

// Calculate hash of initial position
function getInitialHash() { }

// Update hash
function updateHash() { }

// ---------------------------------------------------------------------------------------
// DFS FUNCTIONS
// ---------------------------------------------------------------------------------------

// Plain DFS + Max Depth
function dfsMaxDepth() {
    // Initialize totals
    let tot_time = 0;
    let tot_hashes = 0;
    let tot_states = 0;
    let tot_q_states = 0;

    // Reset counters
    hashes = 0;
    states = 0;
    q_states = 0;

    // Start clock
    start = new Date();

    // Get best move and eval at maximum depth
    var [best_eval, best_move] = ALPHA_BETA_PRUNING ?
        minimaxAlphaBeta(game, game.turn() === "w", evalPos(game), null, 0, -Infinity, Infinity) :
        minimax(game, game.turn() === "w", evalPos(game), null, 0);

    // Calculate time delta
    tot_time = (new Date() - start);

    // Increment totals
    // Only happens once here but important for iterative deepening
    tot_hashes = hashes;
    tot_states = states;
    tot_q_states = q_states;

    // Perform move
    game.move(best_move.san);
    chess.position(game.fen());

    // Print various metrics
    console.log("Eval: " + (best_eval / 100).toFixed(2));
    console.log("Depth: " + (MAX_CONST_DEPTH));
    console.log("Best Move: " + best_move.san);
    console.log("Time Taken: " + (tot_time / 1000).toFixed(3));
    console.log("Hashes Used: " + tot_hashes);
    console.log("Unique States Checked: " + tot_states);
    console.log("Unique Q-States Checked: " + tot_q_states);
    console.log("");
}

// Iterative Deepening
function iterativeDeepening() { }

// ---------------------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------------------

// Intialize visual board
chess = Chessboard("myBoard", "start");
// Loop on playGame
window.setTimeout(playGame, 300); // 300 ms is the quickest the board can move pieces without animation glitches

// Run the selected DFS variation function until the game ends
function playGame() {
    // Print winning message if game ends with checkmate
    if (game.in_checkmate()) {
        if (game.turn() == "w") {
            console.log("Black wins!");
        } else {
            console.log("White wins!");
        }
    }
    // Print boring message if game ends in a draw
    if (game.in_draw()) {
        console.log("It's a Draw.");
    }
    // Exit loop
    if (game.game_over()) return;

    // Get next best move using chosen DFS variation
    ITERATIVE_DEEPENING ? iterativeDeepening() : dfsMaxDepth();

    // Go to next game state
    window.setTimeout(playGame, 300);
}