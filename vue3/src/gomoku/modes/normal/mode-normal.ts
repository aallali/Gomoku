import { DirectionMirror, MoveDirection, type TDirection } from "../../common/directions";
import { validXY } from "../1337/moveValidity";
import type { TMtx, Nb, P, TPoint } from "../../types/gomoku.type";
import { EvalPiece } from "@/gomoku/common/pieceWeight";


/**
 * Checks if the current move results in a win with 5 in a row for the given player.
 * Returns the array of stones forming the winning sequence, or undefined if no win.
 *
 * @param matrix - The game matrix.
 * @param player - The player to check for a win.
 * @param x - The x-coordinate of the latest move.
 * @param y - The y-coordinate of the latest move.
 * @returns The array of stones forming the winning sequence, or undefined if no win.
 */
export function check5Win(matrix: TMtx, player: P, x: Nb, y: Nb) {
    // Get all possible directions to check for a win
    const allDirs = Object.keys(DirectionMirror) as TDirection[];

    // Iterate over each direction
    for (const dir of allDirs) {
        // Check for a winning sequence in the current direction
        const goldenStones = checkWinInDirection(matrix, player, x, y, dir);

        // If a winning sequence is found and it's long enough
        if (goldenStones && goldenStones.length >= 4) {
            // Include the current move in the winning sequence
            if (matrix[x][y] == player)
                goldenStones.unshift({ x, y });

            // Return the winning sequence
            return goldenStones;
        }
    }

    // No winning sequence found
    return undefined;
}

/**
 * Helper function to check a specific direction for a winning sequence.
 *
 * @param matrix - The game matrix.
 * @param player - The player to check for a win.
 * @param x - The x-coordinate of the latest move.
 * @param y - The y-coordinate of the latest move.
 * @param dir - The direction to check.
 * @returns The array of stones forming the winning sequence, or undefined if no win in this direction.
 */
function checkWinInDirection(matrix: TMtx, player: P, x: Nb, y: Nb, dir: TDirection) {
    // Get the mirror direction for symmetry
    const mirrorDir = DirectionMirror[dir] as TDirection;
    // Array to store stones forming the winning sequence
    const goldenStones: { x: Nb, y: Nb }[] = [];

    // Check in the mirrored direction
    let coord = MoveDirection(mirrorDir, x, y);
    while (validXY(matrix.length, coord.x, coord.y) && matrix[coord.x][coord.y] == player) {
        goldenStones.push({ x: coord.x, y: coord.y });
        coord = MoveDirection(mirrorDir, coord.x, coord.y);
    }

    // Check in the original direction
    coord = MoveDirection(dir, x, y);
    while (validXY(matrix.length, coord.x, coord.y) && matrix[coord.x][coord.y] == player) {
        goldenStones.push({ x: coord.x, y: coord.y });
        coord = MoveDirection(dir, coord.x, coord.y);
    }

    // Return the winning sequence if it's non-empty
    return goldenStones.length >= 1 ? goldenStones : undefined;
}

/**
 * @description Get the best move by score for normal mode (5 in a row win).
 *
 * @param matrix - The game matrix.
 * @param player - The current player's color.
 * @param validMoves - Array of valid moves to evaluate.
 * @returns The best move with its score.
 */
export function BestMove_NormalMode(matrix: TMtx, turn: P, validMoves: TPoint[]): TPoint {
    // Determine the opponent's color
    const opponent = (3 - turn) as P

    // Initialize objects to store the best moves for the player and the opponent
    let myBestMove = { x: -1, y: -1, score: -1 };
    let enemyBestMove = { x: -1, y: -1, score: -1 };

    let allScores = []

    // Iterate through the valid moves to evaluate
    for (const { x, y } of validMoves) {
        // Evaluate the move for the current player and the opponent
        const offensiveMove = EvalPiece(matrix, x, y, turn);
        const defensiveMove = EvalPiece(matrix, x, y, opponent);
        allScores.push({ x, y, s: offensiveMove.score, os: defensiveMove.score })
        // Update the best move for the current player if the current move has a higher score
        if (offensiveMove.score > myBestMove.score) {
            myBestMove = { x, y, score: offensiveMove.score };
        }

        // Update the best move for the opponent if the current move has a higher score
        if (defensiveMove.score > enemyBestMove.score) {
            enemyBestMove = { x, y, score: defensiveMove.score };
        }

        // If the move results in a win for the current player, return it immediately
        if (offensiveMove.isWin) {
            return myBestMove;
        }
    }
 

    if (myBestMove.score >= enemyBestMove.score) {
        return myBestMove
    } else {
        const customSort = allScores.filter(l => l.os === enemyBestMove.score).sort((a, b) => {
            if (a.s > b.s) return -1
            if (a.s < b.s) return 1
            if (a.os > b.os) return -1
            if (b.os > a.os) return 1
            return 0
        })
        return customSort[0]
    }
    // Return the best move, preferring the current player's move if the scores are equal
    // return myBestMove.score >= enemyBestMove.score ? myBestMove : enemyBestMove
}
