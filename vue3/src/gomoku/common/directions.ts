import type { Nb } from "../gomoku.type";

export const DirectionMirror = {
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
}
export const directions = Object.keys(DirectionMirror) as TDirection[]
export type TDirection = keyof typeof DirectionMirror;

export function MoveDirection(dir: TDirection, x: Nb, y: Nb) {
    switch (dir) {
        case "right":
            return { x, y: y + 1 }
        case "left":
            return { x, y: y - 1 }
        case "top":
            return { x: x - 1, y }
        case "bot":
            return { x: x + 1, y }
        case "diagTopRight":
            return { x: x - 1, y: y + 1 }
        case "diagTopLeft":
            return { x: x - 1, y: y - 1 }
        case "diagBotRight":
            return { x: x + 1, y: y + 1 }
        case "diagBotLeft":
            return { x: x + 1, y: y - 1 }
        default:
            return { x, y }
    }
}