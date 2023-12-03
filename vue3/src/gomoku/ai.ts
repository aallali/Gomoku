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
        if (consecutives >= 3 && bounds == 0)
            repport.isOpenFour = true;

        repport.score += GetScore(consecutives, bounds);
    }

    delete (repport as PartialBy<TRepport, "directions">).directions
    return repport as Omit<TRepport, "directions">
}

/**
 * @description return score based on total of consecutives and bounds
 */
function GetScore(count: Nb, bound: Nb) {
    if (count >= 4)
        return bound > 0 ? 5000 : 10000

    if (count == 3)
        return bound > 0 ? 500 : 1000

    if (count == 2)
        return bound > 0 ? 50 : 100

    if (count == 1)
        return bound > 0 ? 5 : 200

    return 0
}

/**
 * @description get best move by score for normal mode (5 in row win)
 */
export function BestMove_NormalMode(matrix: TMtx, player: TColor, validMoves: TPoint[]) {
    const opponent = player == "b" ? "w" : "b"
    const myBestMove = {} as TPoint
    const enemyBestMove = {} as TPoint

    myBestMove.score = -1;
    enemyBestMove.score = -1

    for (let i = 0; i < validMoves.length; i++) {
        const { x, y } = validMoves[i];

        const offensiveMove = EvalPiece(matrix, x, y, player);
        const deffensiveMove = EvalPiece(matrix, x, y, opponent);

        if (offensiveMove.isWin)
            return { x, y, score: offensiveMove.score }

        if (offensiveMove.score > myBestMove.score) {
            myBestMove.x = x
            myBestMove.y = y
            myBestMove.score = offensiveMove.score
        }

        if (deffensiveMove.score > enemyBestMove.score) {
            enemyBestMove.x = x
            enemyBestMove.y = y
            enemyBestMove.score = deffensiveMove.score
        }
    }

    return myBestMove.score >= enemyBestMove.score ? myBestMove : enemyBestMove
}