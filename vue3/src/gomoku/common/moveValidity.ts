
import type { TMtx, Nb, TColor, TMode } from "../gomoku.type";
import { MoveDirection, directions, type TDirection } from "./directions";
import { ScrapDirection, Standarize, copyMat } from "./shared";

export function isValidMoveFor1337Mode(matrix: TMtx, turn: TColor, x: Nb, y: Nb) {
    return !isInCapture(copyMat(matrix), turn, x, y) && !isDoubleFreeThree(copyMat(matrix), turn, x, y)
}
export function validXY(size: Nb, x: Nb, y: Nb) {
    return x >= 0 && x < size
        && y >= 0 && y < size
}

function isInCapture(matrix: TMtx, turn: TColor, x: Nb, y: Nb) {
    matrix[x][y] = turn == "b" ? 1 : 2;

    for (let i = 0; i < directions.length; i++) {
        const dir = directions[i];
        const rawPath = ScrapDirection(matrix, 2, 1, x, y, dir);
        const path = Standarize(matrix[x][y] == 1 ? "b" : "w", rawPath);

        if (path == "OXXO")
            return true;
    }

    return false;
}
function isDoubleFreeThree(matrix: TMtx, turn: TColor, x: Nb, y: Nb) {
    // double free three 1: .XXX.
    // double free three 2: .X.XX.
    matrix[x][y] = turn == "b" ? 1 : 2;
    let count = 0
    for (let i = 0; i < 4; i++) {
        const dir = directions[i];
        const rawPath = ScrapDirection(matrix, 5, 5, x, y, dir);
        const path = Standarize(matrix[x][y] == 1 ? "b" : "w", rawPath);

        if (path.includes(".XXX.") || path.includes(".XX.X.") || path.includes(".X.XX.")) {
            if (++count >= 2)
                break;
        }
    }

    matrix[x][y] = 0
    return count > 1
}

export function findValidSpots(matrix: TMtx, turn: TColor, mode: TMode) {
    const cells: { x: Nb, y: Nb }[] = [];
    const boardSize = matrix.length
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {

            if (matrix[i][j] == 0) {

                for (let k = 0; k < directions.length; k++) {
                    const dir = directions[k];
                    let coord = MoveDirection(dir, i, j);

                    if (validXY(boardSize, coord.x, coord.y) && matrix[coord.x][coord.y] != 0) {
                        let valid = true

                        if (mode == "1337")
                            if (!(isValidMoveFor1337Mode(matrix, turn, i, j)))
                                valid = false
                        if (valid)
                            cells.push({ x: i, y: j })
                        break
                    }
                }
            }
        }
    }
    return cells
}