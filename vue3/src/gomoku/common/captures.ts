import type { Nb, TColor, TMtx } from "../gomoku.type"
import { MoveDirection, directions } from "./directions"
import { ScrapDirection, Standarize } from "./shared"


export function IsCapture(matrix: TMtx, x: Nb, y: Nb) {

    const allCaptures = [];
    for (let i = 0; i < directions.length; i++) {
        const dir = directions[i];
        const rawPath = ScrapDirection(matrix, 0, 3, x, y, dir);
        const path = Standarize(matrix[x][y] == 1 ? "b" : "w", rawPath);

        if (path == "XOOX") {
            let coord = MoveDirection(dir, x, y);
            allCaptures.push({ x: coord.x, y: coord.y });

            coord = MoveDirection(dir, coord.x, coord.y);
            allCaptures.push({ x: coord.x, y: coord.y });
        }
    }
    return allCaptures.length ? allCaptures : undefined;
}