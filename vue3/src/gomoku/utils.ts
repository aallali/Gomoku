import { DirectionMirror, MoveDirection, type TDirection } from "./common/directions";
import { findValidSpots, validXY } from "./common/moveValidity";
import type { TMtx, Nb, P } from "./gomoku.type";

export function check5Win(matrix: TMtx, player: P, x: Nb, y: Nb) {
    let goldenStones // define stones that formed the 5 in row 
    const allDirs = Object.keys(DirectionMirror) as TDirection[];

    for (let i = 0; i < allDirs.length; i++) {
        goldenStones = [];
        const dir = allDirs[i];
        const mirrorDir = DirectionMirror[dir] as TDirection;

        let coord = MoveDirection(mirrorDir, x, y);

        while (validXY(matrix.length, coord.x, coord.y)
            && matrix[coord.x][coord.y] == player) {
            goldenStones.push({ x: coord.x, y: coord.y });
            coord = MoveDirection(mirrorDir, coord.x, coord.y);
        }

        coord = MoveDirection(dir, x, y);

        while (validXY(matrix.length, coord.x, coord.y)
            && matrix[coord.x][coord.y] == player) {
            goldenStones.push({ x: coord.x, y: coord.y });
            coord = MoveDirection(dir, coord.x, coord.y);
        }

        if (goldenStones.length >= 4) {
            if (matrix[x][y] == player)
                goldenStones = [{ x, y }, ...goldenStones];
            break;
        }
    }

    return (goldenStones || []).length >= 5 ? goldenStones : undefined
}
