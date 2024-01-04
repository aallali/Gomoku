
import type { TMtx, Nb, TMode, TPoint, P } from "../../types/gomoku.type";
import { directions } from "../../common/directions";
import { ScrapLine, Standarize, cloneMatrix } from "../../common/shared-utils";
import { IsCapture } from "./captures";

/**
 * Determines if a move is valid in the "1337" mode, considering capture and double-free-three conditions.
 * 
 * @param {TMtx} matrix - The game matrix representing the current state.
 * @param {P} turn - The player's color ("b" for black, "w" for white).
 * @param {Nb} x - The x-coordinate of the move.
 * @param {Nb} y - The y-coordinate of the move.
 * @returns {boolean} A boolean indicating whether the move is valid in "1337" mode.
 */
export function isValidMoveFor1337Mode(matrix: TMtx, turn: P, x: Nb, y: Nb): boolean {
    const mtxCopy = cloneMatrix(matrix)
    if (isInCapture(mtxCopy, turn, x, y))
        return false

    if (isDoubleFreeThree(mtxCopy, turn, x, y)) {
        mtxCopy[x][y] = turn
        if (!IsCapture(mtxCopy, x, y))
            return false
    }
    return true
}

/**
 * Checks if the given coordinates `(x, y)` are within the valid range of the game matrix.
 * 
 * @param {Nb} size - The size of the game matrix.
 * @param {Nb} x - The x-coordinate to check.
 * @param {Nb} y - The y-coordinate to check.
 * @returns {boolean} A boolean indicating whether the coordinates are valid.
 */
export function validXY(size: Nb, x: Nb, y: Nb): boolean {
    return x >= 0 && x < size
        && y >= 0 && y < size
}

/**
 * Determines if placing a piece at the specified position results in a capture for the opponent.
 * 
 * @param {TMtx} matrix - The game matrix representing the current state.
 * @param {P} turn - The player's color ("b" for black, "w" for white).
 * @param {Nb} x - The x-coordinate to check.
 * @param {Nb} y - The y-coordinate to check.
 * @returns {boolean} A boolean indicating whether the move results in a capture.
 */
function isInCapture(matrix: TMtx, turn: P, x: Nb, y: Nb): boolean {
    matrix[x][y] = turn
    for (let i = 0; i < directions.length; i++) {
        const dir = directions[i];
        const rawPath = ScrapLine(matrix, 2, 1, x, y, dir);
        const path = Standarize(turn, rawPath);
        if (path == "OXXO")
            return true;
    }

    return false;
}

/**
 * Determines if placing a piece at the specified position results in a double-free-three pattern.
 * 
 * @param {TMtx} matrix - The game matrix representing the current state.
 * @param {P} turn - The player's color ("b" for black, "w" for white).
 * @param {Nb} x - The x-coordinate to check.
 * @param {Nb} y - The y-coordinate to check.
 * @returns {boolean} A boolean indicating whether the move results in a double-free-three pattern.
 */
function isDoubleFreeThree(matrix: TMtx, turn: P, x: Nb, y: Nb): boolean {
    // double free three 1: .XXX.
    // double free three 2: .X.XX.
    matrix[x][y] = turn
    let count = 0
    for (let i = 0; i < 4; i++) {
        const dir = directions[i];
        const rawPath = ScrapLine(matrix, 5, 5, x, y, dir);
        const path = Standarize(turn, rawPath);

        if (path.includes(".XXX.") || path.includes(".XX.X.") || path.includes(".X.XX.")) {
            if (++count > 1)
                break;
        }
    }
    // J8,R1,K9,S2,M12,S3,M13,S1
    matrix[x][y] = 0
    return count > 1
}

/**
 * Finds all valid spots for the current player to make a move on the game board.
 * 
 * @param {TMtx} matrix - The game matrix representing the current state.
 * @param {P} turn - The player's color ("b" for black, "w" for white).
 * @param {TMode} mode - The game mode ("1337" or other).
 * @returns {TPoint[]} An array of coordinates representing valid spots for the player to make a move.
 * 
 * The function performs the following checks:
 * - For each empty cell in the matrix:
 *   - Checks adjacent cells in all directions.
 *   - If the mode is "1337," additional checks are performed to ensure the move is valid.
 *   - Valid spots are added to the result array.
 * 
 */
export function findValidSpots(matrix: TMtx, turn: P, mode: TMode): TPoint[] {
    const cells: { x: Nb, y: Nb }[] = [];
    const boardSize = matrix.length
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {

            if (matrix[i][j] == 0) {
                if (validXY(boardSize, i, j) && matrix[i][j] === 0) {
                    let valid = true
                    if (mode == "1337")
                        if (!(isValidMoveFor1337Mode(matrix, turn, i, j)))
                            valid = false
                    if (valid)
                        cells.push({ x: i, y: j })
                }
            }
        } // J / column loop
    } // I / row loop
    return cells
}