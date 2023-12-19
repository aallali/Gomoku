import type { TMtx, Nb, TColor, TPoint, P } from "../types/gomoku.type";
import { validXY } from "../modes/1337/moveValidity";
import { DirectionMirror, MoveDirection, type TDirection } from "./directions";

/**
 * Scrapes characters from the matrix in a specified direction.
 *
 * @param matrix - The matrix to scrape characters from.
 * @param nLeft - The number of characters to scrape from the left side.
 * @param nRight - The number of characters to scrape from the right side.
 * @param x - The x-coordinate of the starting point.
 * @param y - The y-coordinate of the starting point.
 * @param direction - The direction to scrape characters.
 * @returns The scraped characters.
 */
export function ScrapLine(matrix: TMtx, nLeft: Nb, nRight: Nb, x: Nb, y: Nb, direction: TDirection) {

    const leftSide = scrapDirection(nLeft, matrix, { x, y }, DirectionMirror[direction])
    const rightSide = scrapDirection(nRight, matrix, { x, y }, direction)

    return leftSide.split("").reverse().join("") + matrix[x][y] + rightSide;
}

export function scrapDirection(count: Nb, matrix: TMtx, { x, y }: TPoint, direction: TDirection): string {
    count = count == -1 ? matrix.length : count

    let rowString = ''
    let coord = MoveDirection(direction, x, y);

    while (count && validXY(matrix.length, coord.x, coord.y)) {
        rowString += matrix[coord.x][coord.y]
        coord = MoveDirection(direction, coord.x, coord.y)
        count--;
    }
    return rowString;
}

/**
 * Standardizes the representation of a row based on the player's turn.
 *
 * @param turn - The current player's turn ('b' or 'w').
 * @param row - The input row to standardize. Each cell in the row can be '1', '2', or any other character.
 * @returns The standardized row where '1' is replaced with 'X' or 'O' based on the player's turn,
 * '2' is replaced with the opposite of '1', and other characters are replaced with '.'.
 *
 * @example
 * // If it's player 'b' (black)'s turn:
 * Standarize('b', '121') // Returns 'XOX'
 *
 * // If it's player 'w' (white)'s turn:
 * Standarize('w', '122') // Returns 'OXX'
 */
export function Standarize(turn: P, row: string): string {
    return row.split("").map(cell => (
        cell === "1" ? (turn === 1 ? "X" : "O") :
            cell === "2" ? (turn === 1 ? "O" : "X") :
                "."
    )).join("");
}


/**
 * Blocks the process for a given number of seconds.
 *
 * @param seconds - The number of seconds to block the process.
 * @returns A promise that resolves after the specified time.
 * @example
 * blok(2).then(() => console.log("Blocked for 2 seconds"));
 */
export const blok = (seconds: number): Promise<void> => new Promise(resolve => setTimeout(resolve, seconds * 1000));

/**
 * 
 * @description clone the board data to avoid original state change
 */
export function cloneMatrix(matrix: TMtx) {
    return matrix.map(row => [...row]);
}