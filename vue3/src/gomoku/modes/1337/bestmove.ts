import type { P, TMtx } from "@/gomoku/types/gomoku.type";
import { findValidSpots } from "./moveValidity";
import { Heuristic, type THeuristic } from "./Heuristic";


const { log } = console

export function whatIsTheBestMove(matrix: TMtx, turn: P, player1Captures: number, player2Captures: number, log?: boolean) {
    const availableSpots: THeuristic[] = []
    const validSpots = findValidSpots(matrix, turn, "1337")

    for (let i = 0; i < validSpots.length; i++) {
        const { x, y } = validSpots[i];
        const repporter = new Heuristic()
        repporter.setTurn(turn)
        repporter.setMatrix(matrix)
        repporter.setPoint({ x, y })

        if (repporter.isNearBy()) {
            const repport = repporter.repportObj(player1Captures)
            availableSpots.push({ ...repport, x, y });
        }
    }
    return movesSorter(availableSpots, player1Captures, player2Captures, log)
}

/**
 * 
 * @description 
 * - change the position of a "value" to given position by yswapping values
 */
function changePosition<T>(array: T[], valueToMove: T, newPosition: number): T[] {
    const currentValueIndex = array.indexOf(valueToMove);

    if (currentValueIndex === -1) {
        log(`Value ${valueToMove} not found in the array.`);
        return array; // Value not found, return the original array
    }

    // Remove the value from its current position
    const removedValue = array.splice(currentValueIndex, 1)[0];

    // Insert the value at the new position
    array.splice(newPosition, 0, removedValue);

    return array;
}

function movesSorter(moves: THeuristic[], player1Captures: number, player2Captures: number, log?: boolean) {
    // Define the order of priority for fields
    let fieldPriority: (keyof THeuristic)[] = [

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
        'nes_score',
        'nes_score_opponent'
    ];
    const withCaptures = [...moves]
    moves = moves.filter(l => !l.captured)
    const captures = withCaptures.filter(l => l.capture)
    const captured = moves.filter(l => l.captured)
    const win5 = withCaptures.filter(l => l.win5)
    const blockWin5 = moves.filter(l => l.win5Block)
    const breakWin5 = moves.filter(l => l.winBreak)

    const blockCapture = moves.filter(l => l.captureBlock)
    const setupCapture = moves.filter(l => l.captureSetup)
    const open4 = moves.filter(l => l.open4)
    const open3 = moves.filter(l => l.open3)
    const blockOpen4 = withCaptures.filter(l => l.open4Block)
    const blockOpen3 = moves.filter(l => l.open3Block)

    if (log)
    console.log(`
const win5 = ${win5.length}
const blockWin5 = ${blockWin5.length}
const breakWin5 = ${breakWin5.length}

const captures = ${captures.length}
const captured = ${captured.length}
const blockCapture = ${blockCapture.length}
const setupCapture = ${setupCapture.length}

const open4 = ${open4.length}
const open3 = ${open3.length}
const blockOpen4 = ${blockOpen4.length}
const blockOpen3 = ${blockOpen3.length}
`)

    const badWin5EnemyFilter = (l: THeuristic) => l.captured_opponent && !l.win5

    if (
        player1Captures === 4
        && player2Captures < 5
        && moves.find(badWin5EnemyFilter)
    ) {
        moves = moves.filter(l => !badWin5EnemyFilter(l))
    }
    let additionalMoves = []

    while (1) {
        if (win5.length > 0) {
            if (win5.find(l => !l.captured)) {
                moves = win5
                break
            }
            else if (player2Captures <= 2) {
                moves = win5
                break

            } else if (player2Captures < 4) {
                additionalMoves.push(...win5)
            }
        }

        if (captures.length > 0) {
            if (player1Captures >= 4) {
                moves = captures
                additionalMoves = []
                break
            }
            additionalMoves.push(...captures)
            // break
        }
        if (blockCapture.length > 0 && player2Captures >= 4) {
            moves = blockCapture
            additionalMoves = []
            break
        }

        if (breakWin5.length) {
            moves = breakWin5
            break
        }

        if (blockWin5.length) {
            if (blockWin5.find(l => l.captured_opponent) && player1Captures >= 4) {
            } else {
                moves = blockWin5
                break
            }
        }
        if (setupCapture.length > 0) {
            if (!captures.length)
                additionalMoves.push(...setupCapture)
        }
        if (open4.length) {
            moves = open4
            additionalMoves = []
            break
        }

        if (blockOpen4.length) {
            moves = blockOpen4
            additionalMoves = []
            break
        }

        if (blockCapture.length > 0) {
            moves = blockCapture
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

    
    moves.push(...additionalMoves)

    moves = Array.from(new Set([...moves]))

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
    if (log) {
        sortedArray.forEach((el, i) => {
            console.log(`${i}:---> {x: ${el.x}, y: ${el.y}, cScore: ${el.cScore}}`)
        })
    }
    return sortedArray
}
