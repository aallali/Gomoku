import { useGame, type IGameStore } from "@/store";
import { check5Win } from "./utils";
import { findValidSpots } from "./common/moveValidity";
import { IsCapture } from "./common/captures";

function blok(s: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, s * 1000)
    })
}

export default async function makeMove(x: number, y: number) {

    const {
        matrix, ended, turn, mode,
        setGoldenStones, fillCell, setWinner, endTheGame, setTurn, applyCaptures, setBlinkCapt

    }
        = useGame.getState()
    const otherPlayer = turn == 'b' ? 'w' : 'b'
    const running = !ended
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
            await blok(2)
            setBlinkCapt([])
            totalCaptures = applyCaptures(captures)
        }
    }

    // console.log(totalCaptures)

    if (winStones || totalCaptures >= 5) {
        // TODO: verify if the 5 in row is breakable by enemy
        if (winStones)
            setGoldenStones(winStones)
        setWinner(turn)
        endTheGame()
    } else if (findValidSpots(matrix, otherPlayer, mode).length == 0) {
        endTheGame()
    } else {
        setTurn(otherPlayer)
    }


}