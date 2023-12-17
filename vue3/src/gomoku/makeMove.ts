import { useGame, type IGameStore } from "@/store";
import { check5Win } from "./modes/normal/mode-normal";
import { findValidSpots } from "./modes/1337/moveValidity";
import { IsCapture, extractCaptures, isLineBreakableByAnyCapture } from "./modes/1337/captures";
import { BestMove_NormalMode } from "./modes/normal/mode-normal";
import type { P } from "./types/gomoku.type";
import { whatIsTheBestMove } from "./modes/1337/bestmove";

export default async function makeMove(x: number, y: number) {
    // call methods from the store
    const {
        matrix, turn, mode, players,
        fillCell, setWinner, endTheGame, applyCaptures,
        setTurn,
        setGoldenStones,
        setBlinkCapt,
        setBestMoves
    }
        = useGame.getState()

    // declare the appropriate color for each player
    const otherPlayer = turn == 'b' ? 'w' : 'b'
    const cellValue = turn == "b" ? 1 : 2
    let totalCaptures = players[cellValue === 1 ? "black" : "white"].captures
    let totalCapturesOpponent = players[cellValue === 2 ? "black" : "white"].captures

    // fill the target cell first
    fillCell(x, y)

    // check for 5 in row win
    const winStones = check5Win(matrix, cellValue, x, y)


    // collect captures if any (in '1337' moed only)

    if (mode === "1337") {
        const captures = IsCapture(matrix, x, y)
        if (captures) {
            await setBlinkCapt(captures)
            totalCaptures = applyCaptures(captures)
        }
    }
    // before declare a win by 5 in row, we have to check that enemy have no capture move that collects one of pieces forming the win row
    // - extract all oponent's valid moves
    const oponentValidMoves = findValidSpots(matrix, cellValue, mode)
    // - extract all possible  oponnent's captures moves  if any
    const capturesOfEnemy = extractCaptures(matrix, oponentValidMoves, cellValue)
    // - check breakable line only if captures mode is activated + if there is a win stones row.
    const breakableRow = winStones && mode == "1337" && isLineBreakableByAnyCapture(capturesOfEnemy, winStones)
    const isWinBy5 = winStones && !breakableRow

    // a player declared winner if:
    // 1- aligned atleast 5 pieces in row.
    // 2- if collected atleast 5 captures.
    if (isWinBy5 || totalCaptures >= 5) {
        // hover over win stones if there is.
        if (winStones)
            setGoldenStones(winStones)
        // declare winner and end the game
        setWinner(turn)
        endTheGame()
        return

        // verify if there its TIE (no valid/empty cell to play in + no winner)
    } else if (oponentValidMoves.length == 0) {
        endTheGame()
        return

        // set the move and go next turn
    } else {
        setTurn(otherPlayer)
        // const bestMove = BestMove_NormalMode(matrix, 3 - cellValue as P, oponentValidMoves)
        // setBestMoves([bestMove])

        if (3 - cellValue === 2) {
            console.time("BestMoveExecutionTime:")
            setBestMoves([whatIsTheBestMove(matrix, 3 - cellValue as P, totalCaptures, totalCapturesOpponent)])
            console.timeEnd("BestMoveExecutionTime:")
        } else { setBestMoves([]) }
    }
}


// to fix:
// J8,I7,I9,K7,H10,J7,H7,I6,I5,I8,H9,G9,K6