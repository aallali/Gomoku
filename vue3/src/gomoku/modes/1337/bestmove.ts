import type { P, TMtx } from "@/gomoku/types/gomoku.type";
import { findValidSpots } from "./moveValidity";
import { MoveRepport } from "./prior_moves";


export function whatIsTheBestMove(matrix: TMtx, turn: P, player1Captrues: number, player2Captures: number) {

    const repporter = new MoveRepport()
    repporter.setMatrix(matrix)
    repporter.setTurn(turn)
    let availableSpots = []
    const validSpots = findValidSpots(matrix, turn, "1337")

    for (let i = 0; i < validSpots.length; i++) {
        const move = validSpots[i]
        repporter.setPoint({ x: move.x, y: move.y });
        if (repporter.isNearBy()) {
            const repport = repporter.repportObj()
            if (!repport.willBCaptured)
                availableSpots.push({ x: move.x, y: move.y, ...repport })
        }
    }

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

    // Define the order of priority for fields
    let fieldPriority: string[] = [
        'isWinBy5',
        'blockWinBy5',
        'open4', 'blockOpen4',
        'isCapture', 'captureSetup',
        'blockCapture',
        'isBounded4',
        'open3', 'blockOpen3',
        'isAlginedWithPeer',
        'score',
        'o_score'
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

    const sortedArray = [...availableSpots].sort(compareFunction);

    console.log(`Total sorted moves: ${sortedArray.length}`)
    const chunk = (sortedArray.slice(0, 5))
    chunk.forEach(el => {
        for (const k in el) {
            if (el.hasOwnProperty(k) && el[k as keyof typeof el] === false) {
                delete el[k as keyof typeof el];
            }
        }
        console.log(el)
    })

    return sortedArray[0]
}
