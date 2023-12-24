import { MoveDirection, directions, type TDirection, DirectionMirror } from "@/gomoku/common/directions";
import { ScrapLine, Standarize, cloneMatrix, scrapDirection } from "@/gomoku/common/shared-utils";
import type { P, TMtx, TPoint, TRepport } from "@/gomoku/types/gomoku.type";
import { findValidSpots, isValidMoveFor1337Mode, validXY } from "./moveValidity";
import { EvalPiece } from "@/gomoku/common/pieceWeight";
import { IsCapture, applyCapturesIfAny, extractCaptures, isLineBreakableByAnyCapture } from "./captures";
import { check5Win } from "../normal/mode-normal";

function forEachDirection(cb: (dir: TDirection, iterator: number) => any) {
    for (let i = 0; i < directions.length; i++) {
        const dir = directions[i];
        const cbReturn = cb(dir, i)
        if (cbReturn === true)
            return cbReturn
    }
    return false
}

export interface TMvRepport {
    x: number
    y: number
    capture: boolean,
    captureSetup: boolean,
    captureBlock: boolean
    captured: boolean
    // enemyCapture: this.isWillCaptureForEnemy(),

    open3: boolean
    open3Block: number
    open4: boolean
    open4Block: number

    forbiddenOpponent: boolean

    aligned_siblings: [number, number, number],
    score: number
    cScore: number

    open4Bounded: boolean
    score_opponent: number,

    win5: boolean
    winBreak: number
    win5Block: boolean

    totalCaptures: number
}

export class MoveRepport {
    matrix: TMtx = []
    backupMatrix: TMtx = []
    x: TPoint["x"] = 0
    y: TPoint["y"] = 0

    p: P = 1 // player's cell value
    op: P = 2 // opponent's cell value

    willBreakOpen3: boolean = false
    weight?: Omit<TRepport, "directions">
    o_weight?: Omit<TRepport, "directions">


    finalRepport = {} as TMvRepport
    constructor(matrix?: TMtx, cell?: TPoint, turn?: P) {
        matrix && this.setMatrix(cloneMatrix(matrix));
        turn && this.setTurn(turn);
        cell && this.setPoint(cell);
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
        const { matrix, total: totalCaptures } = applyCapturesIfAny(this.matrix, { x, y })
        this.matrix = matrix
        this.finalRepport.totalCaptures = totalCaptures
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
        const captures = IsCapture(this.matrix, this.x, this.y)
        const [matrix, p, op] = [this.matrix, this.p, this.op]
        if (!captures)
            return false
        for (let i = 0; i < captures.length; i++) {
            const open3Found = forEachDirection(function (dir) {
                const rawPath = ScrapLine(matrix, 3, 3, captures[i].x, captures[i].y, dir);
                const ddd = new RegExp(`0${op}${op}${op}0`)
                if (ddd.test(rawPath))
                    return true
            })
            // TODO: review this
            if (open3Found) {
                this.willBreakOpen3 = true
                break
            }
        }
        return true
    }
    // - block capture [x]
    isBlockCapture() {
        this.matrix[this.x][this.y] = this.op
        return !!IsCapture(this.matrix, this.x, this.y)
    }
    // - will be captured move, if played [x]
    isWillCaptured(coord?: TPoint) {
        let [matrix, x, y, p] = [cloneMatrix(this.matrix), coord?.x || this.x, coord?.y || this.y, this.p]
        matrix[x][y] = p;
        targetLoop: for (let i = 0; i < directions.length; i++) {
            const dir = directions[i];
            const rawPath = ScrapLine(matrix, 2, 1, x, y, dir);
            const path = Standarize(p, rawPath);

            if (/(OXX\.)|(\.XXO)/.test(path)) {
                if (/OXX\./.test(path)) {
                    let coord = MoveDirection(dir, x, y)
                    if (!isValidMoveFor1337Mode(matrix, p, coord.x, coord.y)) {
                        continue targetLoop
                    }
                } else {
                    let coord = { x, y }
                    coord = MoveDirection(DirectionMirror[dir], coord.x, coord.y)
                    coord = MoveDirection(DirectionMirror[dir], coord.x, coord.y)
                    if (!isValidMoveFor1337Mode(matrix, p, coord.x, coord.y)) {
                        continue targetLoop
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
        const [matrix, x, y, p] = [this.matrix, this.x, this.y, turn || this.p]
        this.matrix[x][y] = p;

        for (let i = 0; i < directions.length; i++) {
            const dir = directions[i];
            let leftSide = 4
            let rightSide = 2
            const rawPath = ScrapLine(matrix, leftSide, rightSide, x, y, dir).split("").reverse().join("");
            const path = Standarize(p, rawPath)
            const patterns = [
                /\.\.XXX\./, // eg: [__BBB_]
                /\.XXX\.\./, // eg: [_BBB__]
                /\.X\.XX\./, // eg: [_B_BB_]
                /\.XX\.X\./  // eg: [_BB_B_]
            ];
            const combinedRegex = new RegExp(`(${patterns.map(pattern => pattern.source).join('|')})`);
            const match = combinedRegex.exec(path);
            if (match) {
                let coordList = []
                let counter = 0
                let coord = { x, y }

                breakme: while (counter++ < leftSide) {
                    coord = MoveDirection(DirectionMirror[dir], coord.x, coord.y)
                    if (!validXY(this.matrix.length, coord.x, coord.y))
                        break breakme
                    coordList.push(coord)
                }

                coordList = coordList.reverse()
                coord = { x, y }
                counter = 0

                breakme: while (counter++ < rightSide) {
                    coord = MoveDirection(dir, coord.x, coord.y)
                    if (!validXY(this.matrix.length, coord.x, coord.y))
                        break breakme
                    coordList.push(coord)
                }

                const exactMatchCoordinations = coordList.reverse().slice(path.indexOf(match[0]), match[0].length)
                let isPerfectOpen3 = true

                targetLoop: for (let idx = 0; idx < exactMatchCoordinations.length; idx++) {
                    const { x: ex, y: ey } = exactMatchCoordinations[idx]

                    if (this.matrix[ex][ey] === 0) {
                        if (!isValidMoveFor1337Mode(matrix, this.p, ex, ey)) {
                            isPerfectOpen3 = false
                            break targetLoop
                        }
                    } else {
                        if (this.isWillCaptured({ x: ex, y: ey })) {
                            isPerfectOpen3 = false
                            break
                        }
                    }
                }
                if (isPerfectOpen3) {
                    return true
                }
            }
        }
        return false
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

    isNearBy(_matrix?: TMtx, cell?: TPoint) {
        const [matrix, _x, _y] = [_matrix || this.matrix, cell?.x || this.x, cell?.y || this.y]
        return forEachDirection((dir) => {
            const rawPath = ScrapLine(matrix, 0, 2, _x, _y, dir);
            if (/1|2/.test(rawPath.substring(1))) {
                return true
            }
        }) as boolean
    }
    // Punchline
    repport() {
        this.repportObj()
        let rawTxtRepport = []
        rawTxtRepport.push([`X: ${this.x} | Y: ${this.y}`, ''])
        Object.keys(this.finalRepport).forEach((key) => {
            rawTxtRepport.push([`${key}`, `${this.finalRepport[key as keyof typeof this.finalRepport]}`]);
        });
        return rawTxtRepport
    }
    repportObj() {
        this.evaluateMove()
        this.finalRepport = {
            ...this.finalRepport,
            capture: this.isCapture(),
            captureSetup: this.isCaptureSetup(),
            captureBlock: this.isBlockCapture(),
            captured: this.isWillCaptured(),
            // enemyCapture: this.isWillCaptureForEnemy(),

            open3: this.isOpenThree(),
            open3Block: this.isOpenThreeBlock() || this.finalRepport.open3Block || 0,
            open4: this.isOpenFour(),
            open4Block: this.isOpenFourBlock() || this.willBreakOpen3 || this.finalRepport.open4Block || 0,
            open4Bounded: !!this.weight?.isBounded4,

            forbiddenOpponent: this.isForbiddenForOpponent(),

            aligned_siblings: this.isAlginedWithPeer(),
            score: this.weight?.score || 0,
            score_opponent: this.o_weight?.score || 0,

            win5: this.weight?.isWin || false,
            win5Block: this.o_weight?.isWin || false,
            winBreak: this.finalRepport.winBreak || 0
        } as TMvRepport

        this.finalRepport.cScore = this.scoreIt(this.finalRepport)
        return this.finalRepport
    }
    scoreIt(repport: ReturnType<typeof this.repportObj>) {
        let score = 0
        if (repport.win5)
            score += 10000

        if (repport.capture)
            score += 700

        if (repport.open4)
            score += 600

        if (repport.captureSetup)
            score += 500

        if (repport.open3)
            score += 400

        if (repport.captureBlock)
            score += 300

        return score
    }
}
