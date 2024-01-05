import type { Nb } from "../types/gomoku.type";

const DirectionMirrorTemplate = {
    "top": "bot",
    "diagTopRight": "diagBotLeft",
    "right": "left",
    "diagBotRight": "diagTopLeft",
    // why i split the list like that, in order to avoid 
    // duplicated checks when using mirror
    "bot": "top",
    "left": "right",
    "diagTopLeft": "diagBotRight",
    "diagBotLeft": "diagTopRight"
};

export const directions = Object.keys(DirectionMirrorTemplate) as TDirection[];

export type TDirection = keyof typeof DirectionMirrorTemplate;


export const DirectionMirror = DirectionMirrorTemplate as { [key in TDirection]: TDirection }
/**
 * Moves in a specified direction from the given coordinates.
 *
 * @param dir - The direction to move.
 * @param x - The current x-coordinate.
 * @param y - The current y-coordinate.
 * @returns New coordinates after moving in the specified direction.
 */
export function MoveDirection(dir: TDirection, x: Nb, y: Nb) {
    switch (dir) {
        case "right":
            // Move to the right by increasing the y-coordinate
            return { x, y: y + 1 };
        case "left":
            // Move to the left by decreasing the y-coordinate
            return { x, y: y - 1 };
        case "top":
            // Move to the top by decreasing the x-coordinate
            return { x: x - 1, y };
        case "bot":
            // Move to the bottom by increasing the x-coordinate
            return { x: x + 1, y };
        case "diagTopRight":
            // Move diagonally to the top-right
            return { x: x - 1, y: y + 1 };
        case "diagTopLeft":
            // Move diagonally to the top-left
            return { x: x - 1, y: y - 1 };
        case "diagBotRight":
            // Move diagonally to the bottom-right
            return { x: x + 1, y: y + 1 };
        case "diagBotLeft":
            // Move diagonally to the bottom-left
            return { x: x + 1, y: y - 1 };
        default:
            // No valid direction specified, stay in the current position
            return { x, y };
    }
}
