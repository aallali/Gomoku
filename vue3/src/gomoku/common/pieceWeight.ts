import { validXY } from "../modes/1337/moveValidity";
import type { TMtx, Nb, TRepport, PartialBy, P } from "../types/gomoku.type";
import { directions, type TDirection, MoveDirection, DirectionMirror } from "./directions";

/**
 * Evaluates the score for a given point based on consecutives and bounds.
 * The score helps determine the best move in a 5-In-Row-win mode.
 *
 * @param matrix - The game matrix.
 * @param x - The x-coordinate of the point.
 * @param y - The y-coordinate of the point.
 * @param player - The player color ('b' or 'w').
 * @returns A repport object containing the score and additional information.
 */
export function EvalPiece(matrix: TMtx, x: Nb, y: Nb, turn: P) {
    const size = matrix.length;
    const repport = { score: 0 } as TRepport

    for (let i = 0; i < 4; i++) {
        const dir = directions[i];
        repport.directions = {} as TRepport["directions"]
        repport.directions[dir] = {
            consecutives: 0,
            bounds: 0,
        };

        let coord = MoveDirection(dir, x, y);
        while (1) {
            if (!validXY(size, coord.x, coord.y)) {
                repport.directions[dir].bounds++;
                break
            }

            const cell = matrix[coord.x][coord.y];

            if (cell != turn && cell != 0) {
                repport.directions[dir].bounds++;
                break;
            } else if (cell == 0) {
                break;
            }

            repport.directions[dir].consecutives++;

            coord = MoveDirection(dir, coord.x, coord.y)
        }

        coord = MoveDirection(DirectionMirror[dir] as TDirection, x, y);
        while (1) {
            if (!validXY(size, coord.x, coord.y)) {
                repport.directions[dir].bounds++;
                break
            }

            const cell = matrix[coord.x][coord.y];
            if (cell != turn && cell != 0) {
                repport.directions[dir].bounds++;
                break;
            } else if (cell == 0)
                break;

            repport.directions[dir].consecutives++;
            coord = MoveDirection(DirectionMirror[dir] as TDirection, coord.x, coord.y)
        }
        const consecutives = repport.directions[dir].consecutives;
        const bounds = repport.directions[dir].bounds;

        if (consecutives >= 4) {
            repport.isWin = true;
            repport.score = 111110 /* 10 000*/
            break
        }

        if (bounds == 0) {
            if (consecutives >= 3)
                repport.isOpenFour = true;
            else if (consecutives >= 2)
                repport.isOpenThree = true
        } else {
            if (consecutives >= 3 && bounds == 1) {
                repport.isBounded4 = true
            }
        }

        repport.score += GetScore(consecutives, bounds);
    }

    delete (repport as PartialBy<TRepport, "directions">).directions
    return repport as Omit<TRepport, "directions">
}

/**
 * Calculates the score based on the number of consecutive pieces and bounds.
 *
 * @param {number} count - The number of consecutive pieces (1 to 4).
 * @param {number} bound - The number of bounds (0 or 1).
 * @returns {number} The calculated score.
 * 
 * @example
 * // Example 1: Calculate score for 3 consecutive pieces with 1 bound.
 * const scoreExample1 = GetScore(3, 1);
 * console.log(scoreExample1); // Output: 500
 * 
 * @example
 * // Example 2: Calculate score for 2 consecutive pieces with no bounds.
 * const scoreExample2 = GetScore(2, 0);
 * console.log(scoreExample2); // Output: 500
 */
function GetScore(count: Nb, bound: Nb): number {
    let score = 0
    if (count >= 4) {
        if (bound > 0)
            score += 5000;
        else
            score += 10000;
    }
    else if (count == 3) {
        if (bound > 0)
            score += 500;
        else
            score += 1000;
    }
    else if (count == 2) {
        if (bound > 0)
            score += 50;
        else
            score += 500;
    }
    else if (count == 1) {
        if (bound > 0)
            score += 5;
        else
            score += 200;
    }
    return score
}
