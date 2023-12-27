import type { P, TMtx, TPoint } from "@/gomoku/types/gomoku.type";
import { findValidSpots } from "./moveValidity";
import { MoveRepport, type TMvRepport } from "./MoveRepport";
import { cloneMatrix } from "@/gomoku/common/shared-utils";
import { applyCapturesIfAny } from "./captures";

const { log } = console

export function whatIsTheBestMove(matrix: TMtx, turn: P, player1Captures: number, player2Captures: number) {


    const availableSpots: TMvRepport[] = []
    const validSpots = findValidSpots(matrix, turn, "1337")

    for (let i = 0; i < validSpots.length; i++) {
        const { x, y } = validSpots[i];
        const repporter = new MoveRepport(matrix, { x, y }, turn)

        if (repporter.isNearBy()) {
            const repport = repporter.repportObj()

            // Check if the current spot is not marked for capture by the opponent,
            // or if it is part of a winning line of 5 stones, or if it blocks an opponent's potential win.
            // Also, consider it if it is marked for capture and the current-player captures count is greater than or equal to 4.
            if (
                !repport.captured ||        // Condition: Not marked for capture by the opponent.
                repport.win5 ||             // Condition: Part of a winning line of 5 stones.
                repport.win5Block ||        // Condition: Blocks an opponent's potential win.
                repport.winBreak ||         // Condition: break his 5 win   
                (repport.capture && player1Captures >= 4)  // Condition: Marked for capture and current-player captures count >= 4.
            ) {
                // If any of the conditions is true, add the current spot to the available spots.
                availableSpots.push({ ...repport, x, y });
            }
        }
    }

    return movesSorter(availableSpots, player1Captures, player2Captures)
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

function movesSorter(moves: TMvRepport[], player1Captures: number, player2Captures: number) {
    // Define the order of priority for fields
    let fieldPriority: (keyof TMvRepport)[] = [

        'winBreak',
        'win5',
        'win5Block',
        'capture',
        'captured_opponent',
        'capture',
        'captured',
        'open4',
        'open4Block',
        'totalCaptures',
        'captureSetup',
        'captureBlock',
        'open3',
        'open3Block',
        'aligned_siblings',
        'open4Bounded',
        'open4BoundedBlock',
        'score',
        'score_opponent'
    ];
    moves = moves.filter(l => !l.captured)
    const captures = moves.filter(l => l.capture)
    const win5 = moves.filter(l => l.win5)
    const blockWin5 = moves.filter(l => l.win5Block)
    const breakWin5 = moves.filter(l => l.winBreak)

    const blockCapture = moves.filter(l => l.captureBlock)
    const setupCapture = moves.filter(l => l.captureSetup)
    const open4 = moves.filter(l => l.open4)
    const open3 = moves.filter(l => l.open3)
    const blockOpen4 = moves.filter(l => l.open4Block)
    const blockOpen3 = moves.filter(l => l.open3Block)

    console.log(`
const captures = ${captures.length}
const win5 = ${win5.length}
const blockWin5 = ${blockWin5.length}
const breakWin5 = ${breakWin5.length}

const blockCapture = ${blockCapture.length}
const setupCapture = ${setupCapture.length}
const open4 = ${open4.length}
const open3 = ${open3.length}
const blockOpen4 = ${blockOpen4.length}
const blockOpen3 = ${blockOpen3.length}
`)

    /*
    
- if captures > 0 && myCapture >= 4 X
    : pick capture
- if win5 > 0 && unbreakableWin5 > 0  X
    : pick win5
- if blockCapture > 0 && enemyCapture >= 4 X
    : pick block capture
- if break win5 by capture > 0  X
    : pick capture to break win5
- if block win5 > 0 X
    : pick block5
if block open4
    : pick block4
if open4 > 0
    : pick open4
if block open3
    : pick block3
if open3 > 0
    : pick open 3
    */
    const badWin5EnemyFilter = (l: TMvRepport) => l.captured_opponent && !l.win5

    if (
        player1Captures === 4
        && player2Captures < 5
        && moves.find(badWin5EnemyFilter)
    ) {
        moves = moves.filter(l => !badWin5EnemyFilter(l))
    }
    console.log("Moves", moves.length)
    breakme: while (1) {
        if (captures.length > 0) {
            moves = captures
            break
        }

        if (win5.length > 0) {
            moves = win5
            break
        }

        if (blockCapture.length > 0 && player2Captures >= 4) {
            moves = blockCapture
            break
        }

        if (breakWin5.length) {
            moves = breakWin5
            break
        }

        if (blockWin5.length) {
            if (blockWin5.filter(l => l.captured_opponent) && player1Captures >= 4) {

            } else {

                moves = blockWin5
                break
            }

        }
        
        if (open4.length) {
            moves = open4
            break
        }

        if (blockOpen4.length) {
            moves = blockOpen4
            break
        }
   
        if (blockCapture.length > 0) {
            moves = blockCapture
            break
        }
        if (setupCapture.length > 0) {
            moves = setupCapture
            break
        }
        if (blockOpen3.length) {
            moves = blockOpen3
            break
        }

        if (open3.length) {
            moves = open3
            break
        }
        break
    }




    // Custom comparator function
    const compareFunction = (a: { [x: string]: any; }, b: { [x: string]: any; }): number => {
        for (const field of fieldPriority) {
            if (['captured', 'captured_opponent', 'score_opponent'].includes(field)) {
                if (b[field] !== a[field]) {
                    return a[field] - b[field]
                }
            } else if (field === 'aligned_siblings') {
                if (a[field][0] === b[field][0])
                    if (a[field][1] !== b[field][1])
                        return a[field][1] - b[field][1]
                if (b[field][0] !== a[field][0])
                    return b[field][0] - a[field][0]
            } else {
                if ((b[field] - a[field]) !== 0)
                    return b[field] - a[field]; // Sort in descending order
            }
        }

        return 0; // Objects are equal based on the specified fields
    };
    const sortedArray = [...moves].sort(compareFunction);
    return sortedArray
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
