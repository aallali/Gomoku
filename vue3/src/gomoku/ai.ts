import { DirectionMirror, directions, MoveDirection, type TDirection } from "./common/directions";
import { validXY } from "./common/moveValidity";
import type { Nb, PartialBy, TColor, TMtx, TPoint, TRepport } from "./gomoku.type";

/**
 * 
 * @returns Return a score for given Point based on its consecutives and bounds
 * this score is helpful to know the best move in 5-In-Row-win mode
 */
function EvalPiece(matrix: TMtx, x: Nb, y: Nb, player: TColor) {
    const turn = player == "b" ? 1 : 2

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
            } else if (cell == 0) {
                break;
            }

            repport.directions[dir].consecutives++;
            coord = MoveDirection(DirectionMirror[dir] as TDirection, coord.x, coord.y)
        }

        repport.score += GetScore(repport.directions[dir].consecutives, repport.directions[dir].bounds);
        if (repport.directions[dir].consecutives >= 4) {
            repport.isWin = true;
            break
        }

        if (repport.directions[dir].consecutives >= 3 && repport.directions[dir].bounds == 0) {
            repport.isOpenFour = true;
        }

    }

    delete (repport as PartialBy<TRepport, "directions">).directions
    return repport as Omit<TRepport, "directions">
}

/**
 * @description return score based on total of consecutives and bounds
 */
function GetScore(count: Nb, bound: Nb) {
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

/**
 * @description get best move by score for normal mode (5 in row win)
 */
export function BestMove_NormalMode(matrix: TMtx, player: TColor, validMoves: TPoint[]) {
    const opponent = player == "b" ? "w" : "b"
    const myBestMove = { score: 0 } as TPoint & { score: number }
    const enemyBestMove = { score: 0 } as TPoint & { score: number }

    for (let i = 0; i < validMoves.length; i++) {
        const { x, y } = validMoves[i]

        const myScore = EvalPiece(matrix, x, y, player).score
        const hisScore = EvalPiece(matrix, x, y, opponent).score

        if (myScore > myBestMove.score) {
            myBestMove.x = x
            myBestMove.y = y
            myBestMove.score = myScore
        }
        if (hisScore > enemyBestMove.score) {
            enemyBestMove.x = x
            enemyBestMove.y = y
            enemyBestMove.score = hisScore
        }
    }

    return myBestMove.score >= enemyBestMove.score || myBestMove.score >= 5000 ? myBestMove : enemyBestMove
}