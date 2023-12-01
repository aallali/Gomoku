import { useGame, type IGameStore } from "@/store";
import { check5Win } from "./utils";
import { findValidSpots } from "./common/moveValidity";
import { IsCapture, extractCaptures, isLineBreakableByAnyCapture } from "./common/captures";
import { blok } from "./common/shared";
import { BestMove_NormalMode } from "./ai";

export default async function makeMove(x: number, y: number) {

    const {
        matrix, turn, mode,
        fillCell, setWinner, endTheGame, applyCaptures,
        setTurn,
        setGoldenStones,
        setBlinkCapt,
        setBestMoves
    }
        = useGame.getState()
    const otherPlayer = turn == 'b' ? 'w' : 'b'
    const cellValue = turn == "b" ? 1 : 2

    fillCell(x, y)
    // check 5 in row win
    const winStones = check5Win(matrix, cellValue, x, y)
    // apply captures if any
    let totalCaptures = 0
    if (mode === "1337") {
        const captures = IsCapture(matrix, x, y)
        if (captures) {
            setBlinkCapt(captures)
            await blok(1)
            setBlinkCapt([])
            totalCaptures = applyCaptures(captures)
        }
    }
    const oponentValidMoves = findValidSpots(matrix, otherPlayer, mode)
    const capturesOfEnemy = extractCaptures(matrix, oponentValidMoves, otherPlayer)

    if ((winStones && (mode == "1337" ? !isLineBreakableByAnyCapture(capturesOfEnemy, winStones) : true)) || totalCaptures >= 5) {
        // TODO: verify if the 5 in row is breakable by enemy
        if (winStones)
            setGoldenStones(winStones)
        setWinner(turn)
        endTheGame()
        return
    } else if (oponentValidMoves.length == 0) {
        endTheGame()
        return
    } else {
        setTurn(otherPlayer)
        const bestMove = BestMove_NormalMode(matrix, otherPlayer, oponentValidMoves)
        setBestMoves([bestMove])
    }
}
