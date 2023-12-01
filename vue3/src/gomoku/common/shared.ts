import type { TMtx, Nb, TColor } from "../gomoku.type";
import { validXY } from "../common/moveValidity";
import { DirectionMirror, MoveDirection, type TDirection } from "./directions";

export function copyMat(obj: any) {
    return JSON.parse(JSON.stringify(obj))
}

export function ScrapDirection(matrix: TMtx, nLeft: Nb, nRight: Nb, x: Nb, y: Nb, direction: TDirection) {
    nLeft = nLeft == -1 ? matrix.length : nLeft
    nRight = nRight == -1 ? matrix.length : nRight

    let [leftSide, rightSide] = ["", ""]
    const mirrorDir = DirectionMirror[direction] as TDirection;
    let coord = MoveDirection(mirrorDir, x, y)

    while (nLeft && validXY(matrix.length, coord.x, coord.y)) {
        leftSide += matrix[coord.x][coord.y]
        coord = MoveDirection(mirrorDir, coord.x, coord.y)
        nLeft--
    }

    coord = MoveDirection(direction, x, y)
    while (nRight && validXY(matrix.length, coord.x, coord.y)) {
        rightSide += matrix[coord.x][coord.y]
        coord = MoveDirection(direction, coord.x, coord.y)
        nRight--
    }

    return leftSide.split("").reverse().join("") + matrix[x][y] + rightSide
}

export function Standarize(turn: TColor, row: string) {
    return row.split("").map(c => {
        if (turn == "b") {
            if (c == "1") {
                c = "X"
            } else if (c == "2") {
                c = "O"
            } else {
                c = "."
            }
        } else {
            if (c == "2") {
                c = "X"
            } else if (c == "1") {
                c = "O"
            } else {
                c = "."
            }
        }

        return c
    }).join("");
}

/**
 * 
 * @description blok the process for 's' given secons
 */
export function blok(s: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, s * 1000)
    })
}

/**
 * 
 * @description clone the board data to avoid original state change
 */
export function cloneMatrix(matrix: TMtx) {
    return matrix.map(arr => arr.slice())
}
