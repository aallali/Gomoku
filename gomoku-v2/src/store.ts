import create from "zustand-vue";
import type { P, TMtx, TPoint } from "./gomoku/types/gomoku.type";
import * as R from "ramda"
import go from "./gomoku/GO"
import { Minimax } from "./gomoku/modes/1337/MiniMax";
import { BestMove_NormalMode } from "./gomoku/modes/normal/mode-normal";
import { findValidSpots } from "./gomoku/modes/1337/moveValidity";


export interface IGameStore {
    matrix: TMtx;
    boardSize: number;
    mode: '1337' | 'normal';
    players: {
        1: IPlayer;
        2: IPlayer;
    };
    winner: P | 'T' | null;
    turn: P;
    moves: string[];
    goldenStones: TPoint[] | null
    blinks: TPoint[]
    bestMoves: TPoint[]
    analyse: string
    timeCost: number
}

export interface IPlayer {
    type: "h" | "ai",
    captures: number
    score: number
}

interface IGameActions {
    setBoardSize: (size: number) => void
    setGameMode: (mode: IGameStore["mode"]) => void

    setPlayerType: (player: P, type: IPlayer["type"]) => void

    setGoldenStones: (stones: TPoint[]) => void,
    setTurn: (player: P) => void,

    addPlayerCapture: (player: P, totalCaptures: number) => void


    initMatrix: () => void
    fillCell: (x: number, y: number) => void
    setWinner: (winner: P | 'T') => void
    setMtx: (matrix: TMtx) => void
    setBlinkCapt: (captures: TPoint[]) => Promise<void>

    updateStates: () => void

    setAnalyse: (analyse: string) => void
    undoMove: () => void
    importMove: (rawMoves: string) => void
}

const initState: IGameStore = {
    matrix: go.matrix,
    moves: go.moves,
    boardSize: go.size,
    mode: go.mode,
    players: {
        1: {
            type: "h",
            captures: go.players[1].captures,
            score: go.players[1].score,
        },
        2: {
            type: "h",
            captures: go.players[2].captures,
            score: go.players[2].score,
        },
    },
    winner: go.winner,
    goldenStones: [],
    turn: go.turn,
    blinks: [],
    bestMoves: [],
    analyse: '',
    timeCost: 0
}
export const useGame = create<IGameStore & IGameActions>((set, get) => ({
    ...initState,
    setBoardSize: (size) => {
        go.setSize(size >= 3 && size <= 19 ? size : 19)
        go.initMatrix()
        get().updateStates()
        return set(() => ({ boardSize: go.size }))
        // TODO: reset states
    },
    setMtx: (matrix: TMtx) => set({ matrix }),
    setGameMode: (mode) => {
        go.mode = mode
        set(() => ({ mode }))
    },
    initMatrix: () => {
        go.initMatrix()
        set({ matrix: [...go.matrix] })
    },
    fillCell: (x, y) => {
        go.move({ x, y })
        go.findBestMove()
        get().updateStates()

        if (go.players[go.turn].isAi && !go.winner) {
            setTimeout(async () => {

                if (go.mode === "1337") {
                    let bestMoveByMinimax = await Minimax.findBestMove(go)
                    // set({ bestMoves: [bestMoveByMinimax] })
                    get().fillCell(bestMoveByMinimax.bestMove.x, bestMoveByMinimax.bestMove.y)
                    set({ timeCost: bestMoveByMinimax.timeCost })
                } else {
                    let bestMoveByNES = BestMove_NormalMode(go.matrix, go.turn, findValidSpots(go.matrix, go.turn, "normal"))

                    set({ bestMoves: [bestMoveByNES.bestMove] })
                    get().fillCell(bestMoveByNES.bestMove.x, bestMoveByNES.bestMove.y)
                    set({ timeCost: bestMoveByNES.timeCost })
                }
            }, 500)

        } else set({ bestMoves: [], timeCost: 0 })
        get().updateStates()
    },
    setPlayerType: (player, type) => {
        go.players[player].isAi = type === "ai"
        const players = get().players
        players[player].type = type
        set({ players: { ...players } })
    },

    setTurn: (player) => set({ turn: player }),
    setGoldenStones: (stones) => set({ goldenStones: stones }),
    setWinner: (winner) => set({ winner }),
    setBlinkCapt: (captures): Promise<void> => {
        set({ blinks: captures })
        return new Promise((resolve) => setTimeout(() => {
            set({ blinks: [] })
            resolve()
        }, 300))
    },
    updateStates: () => {
        set({
            matrix: go.matrix,
            moves: [...go.moves],
            players: {
                1: {
                    type: go.players[1].isAi ? "ai" : "h",
                    captures: go.players[1].captures,
                    score: go.players[1].score
                },
                2: {
                    type: go.players[2].isAi ? "ai" : "h",
                    captures: go.players[2].captures,
                    score: go.players[2].score
                },
            },
            turn: go.turn,
            mode: go.mode,
            winner: go.winner,
            goldenStones: go.winStones,
            blinks: go.winStones,
        })
    },
    setAnalyse(analyse) {
        set({ analyse })
    },
    undoMove() {
        go.undo()
        get().updateStates()
    },
    importMove(rawMoves: string) {
        const movesList = rawMoves.split(',')
        go.importMoves(movesList)
        go.findBestMove()
        get().updateStates()
    },
    addPlayerCapture: (turn, totalCaptures) => {
        const colors = {
            1: "black",
            2: "white"
        }
        const currentPlayer = colors[turn];

        set(R.over(R.lensPath(["players", currentPlayer, "captures"]), (c) => c + totalCaptures))
    },
}))

go.setSize(19)

useGame((state) => state.updateStates)()
