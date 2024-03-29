import { Standarize, cloneMatrix } from "./common/shared-utils";
import { Heuristic, type THeuristic } from "./modes/1337/Heuristic";
import { whatIsTheBestMove } from "./modes/1337/bestmove";
import { applyCapturesIfAny, extractCaptures, isLineBreakableByAnyCapture } from "./modes/1337/captures";
import { findValidSpots, isValidMoveFor1337Mode, validXY } from "./modes/1337/moveValidity";
import { check5Win } from "./modes/normal/mode-normal";
import type { P, TMode, TMtx, TPoint } from "./types/gomoku.type";

interface IPlayer {
    captures: number
    isAi: boolean
    score: number
}

interface IPlayers {
    1: IPlayer,
    2: IPlayer
}

const playerObjTemplate: IPlayer = { captures: 0, isAi: false, score: 0 }
const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
function cloneInstance<T>(instance: T): T {
    return Object.assign(Object.create(Object.getPrototypeOf(instance)), instance);
}
class GO {
    matrix: TMtx = []
    backup_matrix: TMtx = []
    mode: TMode = "1337"
    moves: string[] = []
    winner: P | "T" | null = null
    players = {
        1: { ...playerObjTemplate },
        2: { ...playerObjTemplate, isAi: true }
    } as IPlayers
    winStones: TPoint[] = []
    turn: P = 1
    bestMoves: TPoint[] = []
    size: number = 19
    lastPlayed: TPoint
    children: GO[]
    log: boolean
    recentBreakableWin: TPoint[] = []
    constructor() {
        this.lastPlayed = {} as THeuristic
        this.children = [] as GO[]
        this.log = false
    }
    setMatrix(matrix: TMtx) {
        this.matrix = cloneMatrix(matrix)
        this.backup_matrix = cloneMatrix(matrix)
    }
    setSize(size: number) {
        this.size = size
        this.initMatrix()
    }
    initMatrix() {
        const bSize = this.size
        this.matrix = []
        for (let i = 0; i < bSize; i++) {
            this.matrix[i] = []
            for (let j = 0; j < bSize; j++) {
                this.matrix[i][j] = 0
            }
        }
    }
    setTurn(t: P) {
        this.turn = t
    }
    move({ x, y }: TPoint) {
        if (this.matrix[x][y] !== 0)
            throw "Invalid move: non empty cell"
        if (this.mode === "1337") {
            if (isValidMoveFor1337Mode(this.matrix, this.turn, x, y)) {
                this.matrix[x][y] = this.turn;

                const captures = applyCapturesIfAny(this.matrix, { x, y });

                this.matrix = captures.matrix
                this.moves.push(alpha[x] + y)
                if (captures.total) {
                    this.players[this.turn].captures += captures.total
                }
            } else
                throw "Invalid move: forbidden"
        } else {
            if (validXY(this.size, x, y)) {
                this.matrix[x][y] = this.turn;
                this.moves.push(alpha[x] + y)
            }
        }

        this.checkWinner()

        this.setTurn(3 - this.turn as P)

        this.lastPlayed = { x, y }
    }
    getCurrentState() {
        return JSON.stringify(this.players)
    }
    translateMove(move: string): Pick<TPoint, "x" | "y"> {
        if (!/^[A-Z][0-9]{1,2}$/.test(move))
            throw "Invalid Format: move format invalid"
        return {
            x: alpha.indexOf(move[0]),
            y: parseInt(move.substring(1))
        }
    }
    importMoves(moves: string[]): void {
        this.resetStates()
        for (let i = 0; i < moves.length; i++) {
            const { x, y } = this.translateMove(moves[i])
            this.move({ x, y })
        }
    }
    checkWinner() {
        if (this.recentBreakableWin.length) {
            console.log(this.recentBreakableWin)
            const lineAfterCapture = Standarize(3 - this.turn as P, this.recentBreakableWin.map(l => this.matrix[l.x][l.y]).join(""))
            if (lineAfterCapture.includes('XXXXX')) {
                this.winner = 3 - this.turn as P
                this.winStones = this.recentBreakableWin.filter(l => this.matrix[l.x][l.y])
                return
            }
        }

        const { x, y } = this.translateMove(this.moves[this.moves.length - 1])
        // get the opponent's cell value (1 or 2) by simple math, 3 - (1|2) = 1|2 
        const o_turn = 3 - this.turn as P
        // check if there is 5 in row pieces
        const winStones = check5Win(this.matrix, this.turn, x, y)

        // - extract all valid oponnent's moves
        const oponentValidMoves = findValidSpots(this.matrix, o_turn, this.mode)

        if (this.mode === "normal") {
            if (winStones) {
                this.winner = this.turn
                this.winStones = winStones
            } else if (oponentValidMoves.length === 0) {
                this.winner = "T"
            }
            return
        }

        // - extract all possible  oponnent's captures moves  if any
        const capturesOfEnemy = extractCaptures(this.matrix, oponentValidMoves, o_turn)

        // - check breakable line only if captures mode is activated + if there is a win stones row.
        let breakableRow = winStones
            && this.mode === "1337"
            && isLineBreakableByAnyCapture(capturesOfEnemy, winStones)

        if (breakableRow && winStones) {
            breakableRow = false
            for (let i = 0; i < capturesOfEnemy.length; i++) {
                const pair = capturesOfEnemy[i]
                const mtxCopy = cloneMatrix([...this.matrix])
                pair.forEach(p => mtxCopy[p.x][p.y] = 0)
                const lineAfterCapture = Standarize(this.turn, winStones.map(l => mtxCopy[l.x][l.y]).join(""))
                if (!lineAfterCapture.includes('XXXXX')) {
                    breakableRow = true
                    break
                }
            }
        }


        const isWinBy5 = winStones && !breakableRow

        if (breakableRow) {
            this.recentBreakableWin = [...winStones as TPoint[]]
        } else
            this.recentBreakableWin = []
        // a player declared winner if:
        // 1- aligned atleast 5 pieces in row.
        // 2- if collected atleast 5 captures.
        if (isWinBy5 || this.players[this.turn].captures >= 5) {
            // hover over win stones if there is.
            if (winStones)
                this.winStones = winStones
            // declare winner and end the game
            this.winner = this.turn
            return
        } else {
            if (oponentValidMoves.length === 0) {
                this.winner = "T"
                return
            }
        }

    }
    undo() {
        this.moves.pop()
        const movesCopy = [...this.moves]
        this.resetStates()
        this.importMoves(movesCopy)
    }
    resetStates() {
        this.matrix = []
        this.backup_matrix = []
        this.mode = "1337"
        this.moves = []
        this.winner = null
        this.players = {
            1: { ...this.players[1], captures: 0, score: 0 },
            2: { ...this.players[2], captures: 0, score: 0 }
        }
        this.winStones = []
        this.turn = 1
        this.bestMoves = []
        this.initMatrix()
    }

    findBestMove() {
        if (this.mode === "1337") {
            const bestMoves = whatIsTheBestMove(
                this.matrix,
                this.turn,
                this.players[this.turn].captures,
                this.players[3 - this.turn as P].captures,
                this.log)
            if (bestMoves.length) {
                this.bestMoves = bestMoves.slice(0, 1)
                return bestMoves.length >= 10 ? bestMoves.slice(0, 7) : bestMoves
            }
        }
        return []
    }

    generateChildren() {
        const NES_moves = this.findBestMove()
        this.children = NES_moves.map(l => {
            const node = new GO()
            node.matrix = cloneMatrix(this.matrix)
            node.backup_matrix = cloneMatrix(this.backup_matrix)
            node.moves = [...this.moves]
            node.turn = this.turn
            node.size = this.size
            node.players = { 1: { ...this.players[1] }, 2: { ...this.players[2] } }
            node.winner = this.winner
            node.log = false
            node.move({ x: l.x, y: l.y })
            node.lastPlayed = { ...node.lastPlayed, score: l.heurScore }
            return node
        })
    }
    evaluate() {
        const report = new Heuristic()
        report.setMatrix(this.matrix)
        report.setTurn(this.turn)
        report.setPoint(this.lastPlayed)
        const bestMoves = this.findBestMove()
        return bestMoves?.[0]?.heurScore || 0
    }
}

export default new GO()
export const go = GO
