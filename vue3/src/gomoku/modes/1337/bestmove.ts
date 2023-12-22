import type { P, TMtx, TPoint } from "@/gomoku/types/gomoku.type";
import { findValidSpots } from "./moveValidity";
import { MoveRepport, type TMvRepport } from "./prior_moves";
import { cloneMatrix } from "@/gomoku/common/shared-utils";
import { applyCapturesIfAny } from "./captures";

const { log } = console

export function whatIsTheBestMove(matrix: TMtx, turn: P, player1Captrues: number, player2Captures: number) {

    const repporter = new MoveRepport()
    repporter.setMatrix(matrix)
    repporter.setTurn(turn)
    let availableSpots = []
    const validSpots = findValidSpots(matrix, turn, "1337")

    for (let i = 0; i < validSpots.length; i++) {
        const move = validSpots[i]
        const { x, y } = move
        repporter.setPoint({ x: move.x, y: move.y });
        if (repporter.isNearBy()) {
            const repport = repporter.repportObj()
            if (!repport.willBCaptured)
                availableSpots.push({ ...repport, x, y, })
            else if (repport.isWinBy5 || repport.blockWinBy5)
                availableSpots.push({ ...repport, x, y, })
        }
    }

    return movesSorter(availableSpots, turn, player1Captrues, player2Captures)
}

/**
 * 
 * @description 
 * - change the position of a "value" to given position by yswapping values
 */
function changePosition<T>(array: T[], valueToMove: T, newPosition: number): T[] {
    const currentValueIndex = array.indexOf(valueToMove);

    if (currentValueIndex === -1) {
        console.log(`Value ${valueToMove} not found in the array.`);
        return array; // Value not found, return the original array
    }

    // Remove the value from its current position
    const removedValue = array.splice(currentValueIndex, 1)[0];

    // Insert the value at the new position
    array.splice(newPosition, 0, removedValue);

    return array;
}

function movesSorter(moves: TMvRepport[], player: P, player1Captrues: number, player2Captures: number) {
    // Define the order of priority for fields
    let fieldPriority: string[] = [
        'isWinBy5',
        'blockWinBy5',
        'open4', 'blockOpen4',
        'isCapture', 'captureSetup',
        'blockCapture',
        'open3', 'blockOpen3',
        'isAlginedWithPeer',
        'score',
        'o_score',
        'isBounded4',
    ];

    if (player1Captrues === 4)
        fieldPriority = changePosition(fieldPriority, 'isCapture', 0);
    else if (player2Captures === 4)
        fieldPriority = changePosition(fieldPriority, 'blockCapture', 0);

    // Custom comparator function
    const compareFunction = (a: { [x: string]: any; }, b: { [x: string]: any; }): number => {
        for (const field of fieldPriority) {
            if (field === 'score' || field === 'o_score') {
                if (b[field] !== a[field])
                    return b[field] - a[field]
            }
            if (field === 'isAlginedWithPeer') {
                if (a[field][0] === b[field][0])
                    if (a[field][1] !== b[field][1])
                        return a[field][1] - b[field][1]
                if (b[field][0] !== a[field][0])
                    return b[field][0] - a[field][0]
            }

            const aValue = a[field] ? 1 : 0;
            const bValue = b[field] ? 1 : 0;

            if (aValue !== bValue) {
                return bValue - aValue; // Sort in descending order
            }
        }

        return 0; // Objects are equal based on the specified fields
    };

    const sortedArray = [...moves].sort(compareFunction);

    const chunk = sortedArray
    chunk.forEach(el => {
        for (const k in el) {
            if (el.hasOwnProperty(k) && el[k as keyof typeof el] === false) {
                delete el[k as keyof typeof el];
            }
        }
    })
    return chunk
}
//  TODO: refactor
export function miniMax(moves: TPoint[], player: P, matrix: TMtx) {
    console.clear()
    const opponent = 3 - player as P;
    let mmMoves = []
    let mvMap = new Map()
    for (let i = 0; i < moves.length; i++) {
        const { x, y } = moves[i]
        let cloneMtx = cloneMatrix(matrix)
        cloneMtx[x][y] = player
        cloneMtx = applyCapturesIfAny(cloneMtx, { x, y }).matrix
        const bestScore = whatIsTheBestMove(cloneMtx, opponent, 1, 1);
        log(x, y, 'Best for him: ', bestScore[0].x, bestScore[0].y)
        mmMoves.push(bestScore[0])
        const cleanObj = { x: bestScore[0].x, y: bestScore[0].y }
        const ky = `${cleanObj.x}|${cleanObj.y}`

        if (!mvMap.get(ky))
            mvMap.set(ky, { x, y })
    }

    // const sorted = movesSorter(mmMoves, opponent, 1, 1).reverse()
    const sorted = mmMoves.sort((a, b) => a.cScore - b.cScore)
    const cleanObj = { x: sorted[0].x, y: sorted[0].y }

    return mvMap.get(`${cleanObj.x}|${cleanObj.y}`)
}
