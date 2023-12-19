import type { TDirection } from "../common/directions"

export type TMtx = (0 | 1 | 2)[][]
export type Nb = number
/**
 * Player representative value
 * - 1 stands for Black
 * - 2 stands for White
 */
export type P = 1 | 2
export type TColor = "b" | "w"
export type TPoint = { x: Nb, y: Nb, score?: Nb }
export type TMode = "1337" | "normal"

export interface TRepport {
    directions: {
        [key in TDirection]: {
            consecutives: number,
            bounds: number
        };
    }
    isWin?: boolean
    score: number
    isBounded4?: boolean
    isOpenFour?: boolean
    isOpenThree?: boolean
}

// export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>