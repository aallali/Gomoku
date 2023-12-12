import create from "zustand-vue";
import type { TMtx, TPoint } from "./gomoku/types/gomoku.type";
import * as R from "ramda"

export interface IGameStore {
    matrix: TMtx;
    boardSize: number;
    mode: '1337' | 'normal';
    players: {
        black: IPlayer;
        white: IPlayer;
    };
    ended: boolean;
    winner: IPlayerColor | null;
    turn: IPlayerColor;
    moves: string[];
    goldenStones: TPoint[] | null
    blinks: TPoint[]
    bestMoves: TPoint[]
}

type IPlayerColor = "b" | "w";

export interface IPlayer {
    type: "h" | "ai",
    captures: number
    score: number
}

interface IGameActions {
    setBoardSize: (size: number) => void
    setGameMode: (mode: IGameStore["mode"]) => void

    setPlayerType: (player: IPlayerColor, type: IPlayer["type"]) => void
    setPlayerScore: (player: IPlayerColor, score: IPlayer["score"]) => void
    addPlayerCapture: (player: IPlayerColor, totalCaptures: number) => void

    setGoldenStones: (stones: TPoint[]) => void,
    setTurn: (plauer: IPlayerColor) => void,
    applyCaptures: (captures: { x: number, y: number }[]) => number
    endTheGame: () => void

    initMatrix: () => void
    fillCell: (x: number, y: number) => void
    setMoves: (moves: string[]) => void
    setWinner: (winner: IPlayerColor) => void

    setBlinkCapt: (captures: TPoint[]) => void
    setBestMoves: (bestMoves: TPoint[]) => void

    resetStates: () => void
}

const initState: IGameStore = {
    matrix: [],
    moves: [],
    boardSize: 19,
    mode: '1337',
    players: {
        black: {
            type: "h",
            captures: 3,
            score: 0
        },
        white: {
            type: "ai",
            captures: 3,
            score: 0
        },
    },
    winner: null,
    goldenStones: null,
    ended: false,
    turn: "b",
    blinks: [],
    bestMoves: []
}
export const useGame = create<IGameStore & IGameActions>((set, get) => ({
    ...initState,
    setBoardSize: (size) => {
        set(() => ({ boardSize: size >= 3 && size <= 19 ? size : 19 }))
        get().initMatrix()
        get().resetStates()
    },
    setGameMode: (mode) => set(() => ({ mode })),
    initMatrix: () => {
        const bSize = get().boardSize
        let matrix: any = []
        for (let i = 0; i < bSize; i++) {
            matrix[i] = []
            for (let j = 0; j < bSize; j++)
                matrix[i][j] = 0
        }
        set({ matrix })
    },
    fillCell: (x, y) => {
        const alpha = 'ABCDEFGHIJKLMNOPQRS'
        const matrix = get().matrix
        const turn = get().turn
        const cellValue = turn === "b" ? 1 : 2
        // const newTurn = turn == "b" ? "w" : "b"
        matrix[x][y] = cellValue;
        set({
            matrix: [...matrix],
            moves: [...get().moves, `${alpha[x]}${y}`],
        })
    },
    setPlayerType: (player, type) => {
        const players = get().players
        players[player === "b" ? "black" : "white"].type = type
        set({ players: { ...players } })
    },
    setPlayerScore: (player, score) => set(state => ({})),
    addPlayerCapture: (turn, totalCaptures) => {
        const currentPlayer = turn == "b" ? "black" : "white"
        // console.log(R.over(R.lensPath(["players", currentPlayer, "captures"])))
        // const players = get().players
        // players[currentPlayer].captures += totalCaptures
        // set({ players: JSON.parse(JSON.stringify(players)) })
        set(R.over(R.lensPath(["players", currentPlayer, "captures"]), (c) => c + totalCaptures))
    },
    setTurn: (player) => set({ turn: player }),
    applyCaptures: (captures) => {
        const matrix = get().matrix
        for (let i = 0; i < captures.length; i++) {
            const { x, y } = captures[i]
            matrix[x][y] = 0
        }

        set({ matrix: [...matrix] })
        const addPlayerCapture = useGame((state) => state.addPlayerCapture)
        addPlayerCapture(get().turn, Math.ceil((captures.length / 2)))
        // console.log(get().players[get().turn == "b" ? "black" : "white"])
        return get().players[get().turn == "b" ? "black" : "white"].captures
    },

    endTheGame: () => set({ ended: true }),
    setGoldenStones: (stones) => set({ goldenStones: stones }),
    setMoves: (moves) => set({ moves }),
    setWinner: (winner) => set({ winner }),
    setBlinkCapt: (captures) => set({ blinks: captures }),
    setBestMoves: (bestMoves) => set({ bestMoves }),

    resetStates: () => set((state) => ({
        moves: [],
        players: {
            black: {
                type: 'h',
                captures: 0,
                score: 0
            },
            white: {
                type: 'h',
                captures: 0,
                score: 0
            },
        },
        mode: "normal",
        winner: null,
        goldenStones: null,
        ended: false,
        blinks: [],
        bestMoves: []
    }))
}))

useGame((state) => state.initMatrix)()
