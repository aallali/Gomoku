import { MoveDirection, directions, type TDirection } from "@/gomoku/common/directions";
import { ScrapLine, Standarize, cloneMatrix, scrapDirection } from "@/gomoku/common/shared-utils";
import type { P, TColor, TMtx, TPoint, TRepport } from "@/gomoku/types/gomoku.type";
import { findValidSpots, isValidMoveFor1337Mode, validXY } from "./moveValidity";
import { EvalPiece } from "@/gomoku/common/pieceWeight";
import { IsCapture, extractCaptures, isLineBreakableByAnyCapture } from "./captures";
import { check5Win } from "../normal/mode-normal";

function forEachDirection(cb: (dir: TDirection) => any) {
    for (let i = 0; i < directions.length; i++) {
        const dir = directions[i];
        const cbReturn = cb(dir)
        if (cbReturn === true)
            return cbReturn
    }
    return false
}

export class MoveRepport {
    matrix: TMtx = []
    backupMatrix: TMtx = []
    x: TPoint["x"] = 0
    y: TPoint["y"] = 0

    p: P = 1 // player's cell value
    op: P = 2 // opponent's cell value

    weight?: Omit<TRepport, "directions">
    o_weight?: Omit<TRepport, "directions">

    constructor(matrix?: TMtx, cell?: TPoint, turn?: P) {
        matrix && this.setMatrix(cloneMatrix(matrix));
        cell && this.setPoint(cell)
        turn && this.setTurn(turn)
    }

    setMatrix(matrix: TMtx) {
        this.matrix = cloneMatrix(matrix)
        this.backupMatrix = matrix
    }

    setPoint({ x, y }: TPoint) {
        [this.x, this.y] = [x, y]
        this.setMatrix(this.backupMatrix)
        this.matrix = cloneMatrix(this.backupMatrix)
        this.matrix[x][y] = this.p
    }

    setTurn(turn: P) {
        this.p = turn
        this.op = (3 - turn) as P
    }

    evaluateMove() {
        const [matrix, x, y, p, op] = [this.matrix, this.x, this.y, this.p, this.op]
        this.weight = EvalPiece(matrix, x, y, p)
        this.o_weight = EvalPiece(matrix, x, y, op)
    }
    // - setup capture [x]
    isCaptureSetup(turn?: P) {
        const [matrix, x, y, p] = [this.matrix, this.x, this.y, turn || this.p]
        this.matrix[x][y] = p;
        // loop through all directions and try to find this path "XOO."
        // X : current player
        // O : opponent player
        // . : empty
        for (let i = 0; i < directions.length; i++) {
            const dir = directions[i];
            const rawPath = ScrapLine(matrix, 0, 3, x, y, dir);
            if (Standarize(p, rawPath) == "XOO.") {
                let coord = { x, y }
                // shift the {x,y} 3 times towared direction
                // [0]****
                // *[1]***
                // **[2]**
                // ***[3]*
                let lp = 3;
                while (lp--) {
                    MoveDirection(dir, coord.x, coord.y)
                }
                if (!isValidMoveFor1337Mode(matrix, p, coord.x, coord.y)) {
                    return false
                }
                return true;
            }
        }
        return false;
    }
    isCapture() {
        this.matrix[this.x][this.y] = this.p
        return !!IsCapture(this.matrix, this.x, this.y)
    }
    // - block capture [x]
    isBlockCapture() {
        this.matrix[this.x][this.y] = this.op
        return !!IsCapture(this.matrix, this.x, this.y)
    }
    // - will be captured move, if played [x]
    isWillCaptured() {
        const [matrix, x, y, p] = [cloneMatrix(this.matrix), this.x, this.y, this.p]
        matrix[x][y] = p;
        // TODO: find and apply captures
        for (let i = 0; i < directions.length; i++) {
            const dir = directions[i];
            const rawPath = ScrapLine(matrix, 2, 1, x, y, dir);
            const path = Standarize(p, rawPath);
            if (/(OXX\.)|(\.XXO)/.test(path)) {
                if (/OXX\./.test(path)) {
                    let coord = MoveDirection(dir, x, y)
                    if (!isValidMoveFor1337Mode(matrix, p, coord.x, coord.y)) {
                        continue
                    }
                } else {
                    let coord = { x, y }
                    MoveDirection(dir, coord.x, coord.y)
                    MoveDirection(dir, coord.x, coord.y)
                    if (!isValidMoveFor1337Mode(matrix, p, coord.x, coord.y)) {
                        continue
                    }
                }
                return true;
            }
        }

        return false;
    }
    _isWillCaptureForEnemy() {
        const [matrix, x, y, op] = [cloneMatrix(this.matrix), this.x, this.y, this.op]
        matrix[x][y] = op;
        // TODO: find and apply captures
        for (let i = 0; i < directions.length; i++) {
            const dir = directions[i];
            const rawPath = ScrapLine(matrix, 2, 1, x, y, dir);
            const path = Standarize(op, rawPath);
            if (/(OXX\.)|(\.XXO)/.test(path)) {
                if (/OXX\./.test(path)) {
                    let coord = MoveDirection(dir, x, y)
                    if (!isValidMoveFor1337Mode(matrix, op, coord.x, coord.y)) {
                        continue
                    }
                } else {
                    let coord = { x, y }
                    MoveDirection(dir, coord.x, coord.y)
                    MoveDirection(dir, coord.x, coord.y)
                    if (!isValidMoveFor1337Mode(matrix, op, coord.x, coord.y)) {
                        continue
                    }
                }
                return true;
            }
        }

        return false;
    }

    // - move will make another spot forbidden for enemy
    isCellBlock() { }
    // - free three
    isOpenThree(turn?: P): boolean {
        // TODO: collect it from Eval
        // const [matrix, x, y, p] = [this.matrix, this.x, this.y, turn || this.p]
        // this.matrix[x][y] = p;
        // for (let i = 0; i < 4; i++) {
        //     const dir = directions[i];
        //     const rawPath = ScrapLine(matrix, 5, 5, x, y, dir);
        //     const path = Standarize(p, rawPath);
        //     const patterns = [
        //         /\.\.XXX\./, // eg: [__BBB_]
        //         /\.XXX\.\./, // eg: [_BBB__]
        //         /\.X\.XX\./, // eg: [_B_BB_]
        //         /\.XX\.X\./  // eg: [_BB_B_]
        //     ];
        //     const combinedRegex = new RegExp(`(${patterns.map(pattern => pattern.source).join('|')})`);

        //     if (combinedRegex.test(path)) {
        //         return true;
        //     }
        // }

        // return false
        if (!this.weight)
            this.evaluateMove()
        return this.weight?.isOpenThree || false
    }
    // - block open there
    isOpenThreeBlock(): boolean {
        if (!this.o_weight)
            this.evaluateMove()
        return this.o_weight?.isOpenThree || false
    }
    // - free four
    isOpenFour(): boolean {
        if (!this.weight)
            this.evaluateMove()
        return this.weight?.isOpenFour || false
    }
    // - block open four
    isOpenFourBlock(): boolean {
        if (!this.o_weight)
            this.evaluateMove()
        return this.o_weight?.isOpenFour || false
    }
    // - is aligned with another 
    /**
     * 
     * @description
     * - calculate how many aligned peer pieces with that cell
     * - calculate how much distance from those aligned pieces if found 
     */
    isAlginedWithPeer(): [number, number, number] {
        let distance = 0
        let totalAligns = 0
        const [matrix, x, y, p] = [this.matrix, this.x, this.y, this.p]
        this.matrix[x][y] = p;
        forEachDirection((dir) => {
            let moves = 5
            let coord = { x, y }
            while (moves--) {
                coord = MoveDirection(dir, coord.x, coord.y)
                if (!validXY(matrix.length, coord.x, coord.y)) { break }

                if (matrix[coord.x][coord.y] === this.op) { break }
                if (matrix[coord.x][coord.y] === this.p) {
                    totalAligns++
                    distance += 4 - moves
                    return
                }
            }
        })
        return [totalAligns, distance, totalAligns - distance]
    }

    isForbiddenForOpponent(): boolean {
        return !isValidMoveFor1337Mode(this.matrix, this.op, this.x, this.y)
    }
    // - win move (5 in row)
    isRowWin(): boolean {
        const oponentValidMoves = findValidSpots(this.matrix, this.p, "1337")
        const capturesOfEnemy = extractCaptures(this.matrix, oponentValidMoves, this.op)
        const winStones = check5Win(this.matrix, this.p, this.x, this.y)
        const breakableRow = winStones && isLineBreakableByAnyCapture(capturesOfEnemy, winStones)
        return !!winStones && !breakableRow
    }
    // - win move (5th capture)
    isCaptureWin(): boolean { return false }

    isNearBy() {
        return forEachDirection((dir) => {
            const rawPath = ScrapLine(this.matrix, 0, 1, this.x, this.y, dir);
            if (/1|2/.test(rawPath.substring(1))) {
                return true
            }
        }) as boolean
    }
    // Punchline
    repport() {
        this.evaluateMove()
        // console.clear()
        const drepport = {
            isCapture: this.isCapture(),
            captureSetup: this.isCaptureSetup(),
            blockCapture: this.isBlockCapture(),
            willBCaptured: this.isWillCaptured(),
            // enemyCapture: this.isWillCaptureForEnemy(),
            open3: this.isOpenThree(),
            blockOpen3: this.isOpenThreeBlock(),
            open4: this.isOpenFour(),
            blockOpen4: this.isOpenFourBlock(),
            isAlginedWithPeer: this.isAlginedWithPeer(),
            forbiddenOpponent: this.isForbiddenForOpponent(),
            isNearBy: this.isNearBy(),
            score: this.weight?.score || 0,
            isWinBy5: this.weight?.isWin || 0,
            blockWinBy5: this.o_weight?.isWin || false,
            opponentScore: this.o_weight?.score || 0
        }
        // console.clear()
        let rawTxtRepport = []
        rawTxtRepport.push([`X: ${this.x} | Y: ${this.y}`, ''])
        Object.keys(drepport).forEach((key) => {
            rawTxtRepport.push([`${key}`, `${drepport[key as keyof typeof drepport]}`]);
        });
        return rawTxtRepport
    }
    repportObj() {
        this.evaluateMove()
        const drepport = {
            isCapture: this.isCapture(),
            captureSetup: this.isCaptureSetup(),
            blockCapture: this.isBlockCapture(),
            willBCaptured: this.isWillCaptured(),
            // enemyCapture: this.isWillCaptureForEnemy(),

            open3: this.isOpenThree(),
            blockOpen3: this.isOpenThreeBlock(),
            open4: this.isOpenFour(),
            blockOpen4: this.isOpenFourBlock(),

            forbiddenOpponent: this.isForbiddenForOpponent(),

            isAlginedWithPeer: this.isAlginedWithPeer(),
            score: this.weight?.score || 0,
            opponentScore: this.o_weight?.score || 0,

            isWinBy5: this.weight?.isWin || 0,
            blockWinBy5: this.o_weight?.isWin || false,

        }

        return drepport as typeof drepport
    }
}