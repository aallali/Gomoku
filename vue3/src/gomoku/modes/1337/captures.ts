import type { Nb, P, TColor, TMtx, TPoint } from "../../types/gomoku.type"
import { MoveDirection, directions } from "../../common/directions"
import { ScrapLine, Standarize, cloneMatrix } from "../../common/shared-utils"


export function IsCapture(matrix: TMtx, x: Nb, y: Nb) {

    const allCaptures = [];
    for (let i = 0; i < directions.length; i++) {
        const dir = directions[i];
        const rawPath = ScrapLine(matrix, 0, 3, x, y, dir);
        const path = Standarize(matrix[x][y] as P, rawPath);

        if (path == "XOOX") {
            let coord = MoveDirection(dir, x, y);
            allCaptures.push({ x: coord.x, y: coord.y });

            coord = MoveDirection(dir, coord.x, coord.y);
            allCaptures.push({ x: coord.x, y: coord.y });
        }
    }
    return allCaptures.length ? allCaptures : undefined;
}
/**
 * 
 * @description loop through all valid spots for given player and get available captures for him.
 */
export function extractCaptures(matrix: TMtx, moves: TPoint[], player: P): TPoint[][] {
    const cloneMtx = cloneMatrix(matrix)
    return moves.map(move => {
        const { x, y } = move

        cloneMtx[x][y] = player
        const capts = IsCapture(cloneMtx, move.x, move.y)
        cloneMtx[x][y] = 0

        return capts
    }).filter(l => l) as TPoint[][]
}

/**
*  @description takes 2 params:<br>
*  1: list of capture pieces of Player-A <br>
*  2: list of win stones that formed the win line for Player-B
*   
*  verify if any of the win stones exists withing the capture pieces <br>
*  the purpose of this check, to prevent declare a win of a player untill <br>
*  check that his win row is not breakable by any capture from the enemy
*/
export function isLineBreakableByAnyCapture(captures: TPoint[][], stonesLine: TPoint[]): boolean {
    return !!captures
        .filter(m => m
            .find(c => stonesLine
                .map(l => l.x.toString() + '.' + l.y)
                .join(",")
                .includes(c.x + '.' + c.y))).length

/**
 * Applies captures if any at the specified position in the matrix.
 * @param matrix - The game matrix.
 * @param point - The position coordinates { x, y }.
 * @returns An object containing the updated matrix and the total number of captures.
 */
export function applyCapturesIfAny(matrix: TMtx, { x, y }: TPoint): { matrix: TMtx; total: number } {
    // Check for captures at the specified position
    const captures = IsCapture(matrix, x, y);

    // Apply captures to the matrix if found
    captures?.forEach((cell) => {
        matrix[cell.x][cell.y] = 0;
    });

    // Return the updated matrix and the total number of captures
    return { matrix, total: captures?.length || 0 };
}
