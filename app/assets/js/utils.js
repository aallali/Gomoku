
const DirectionMirror = {
    "top": "bot",
    "diagTopRight": "diagBotLeft",
    "right": "left",
    "diagBotRight": "diagTopLeft",
    // why i split the list like that, in order to avoid duplicated checks when using mirror
    "bot": "top",
    "left": "right",
    "diagTopLeft": "diagBotRight",
    "diagBotLeft": "diagTopRight"
}
const Patterns = {}
function Point(x, y, s) {
    this.x = x;
    this.y = y;
    this.score = s
}
function myLog(...params) {
    console.log(...params)
}
/**
 * 
 * @param {keyof DirectionMirror} dir 
 * @param {number} x 
 * @param {number} y 
 * @returns 
 */
function MoveDirection(dir, x, y) {
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
/**
 * 
 * @param {number} size 
 * @param {number} x 
 * @param {number} y 
 * @returns {boolean} if x and y are in the range of 0<x<size
 */
function ValidXY(size, x, y) {
    return x >= 0 && x < size && y >= 0 && y < size
}
/**
 * 
 * @param {(0 | 1 | 2)[18][18]} matrix 
 * @param {number} x 
 * @param {number} y 
 * @returns {undefined | number}
 */
function findAndApplyCaptures(matrix, x, y) {
    const captures = IsCapture(matrix, x, y)
    if (captures) {
        for (i in captures) {
            const capt = captures[i]
            matrix[capt.x][capt.y] = 0
        }
        return captures.length
    }
    return 0
}
/**
 * 
 * @param {(0 | 1 | 2)[18][18]} matrix 
 * @param {1 | 2} turn 
 * @param {number} x 
 * @param {number} y 
 * @returns {boolean} if the move will perform a double free three pattern ('.XXX.' or '.X.XX.')
 */
function IsDoubleFreeThree(matrix, turn, x, y) {
    // double free three 1: .XXX.
    // double free three 12: .X.XX.
    const allDirs = Object.keys(DirectionMirror);
    matrix[x][y] = turn;
    let count = 0
    for (let i = 0; i < 4; i++) {
        const dir = allDirs[i];
        const rawPath = ScrapDirection(matrix, 5, 5, x, y, dir);
        const path = Standarize(matrix[x][y] == 1 ? "Black" : "White", rawPath);

        if (path.includes(".XXX.") || path.includes(".XX.X.") || path.includes(".X.XX.")) {
            count++;
            if (count >= 2) {
                break;
            }
        }
    }

    matrix[x][y] = 0
    return count > 1
}
/**
 * 
 * @param {(0 | 1 | 2)[18][18]} matrix 
 * @param {1 | 2} turn 
 * @param {number} x 
 * @param {number} y 
 * @returns {boolean} if the move is in capture spot, e.g: 'OX.O', putting X in the empty spot will perform a capture for O
 */
function IsInCapture(matrix, turn, x, y) {
    const allDirs = Object.keys(DirectionMirror);
    matrix[x][y] = turn;

    for (let i = 0; i < allDirs.length; i++) {
        const dir = allDirs[i];
        const rawPath = ScrapDirection(matrix, 2, 1, x, y, dir);
        const path = Standarize(matrix[x][y] == 1 ? "Black" : "White", rawPath);

        if (path == "OXXO") {
            return true;
        }
    }

    return false;
}
/**
 * 
 * @param {(0 | 1 | 2)[18][18]} matrix 
 * @param {number} x 
 * @param {number} y 
 * @returns 
 */
function IsCapture(matrix, x, y) {
    const allDirs = Object.keys(DirectionMirror);
    const allCaptures = [];
    for (let i = 0; i < allDirs.length; i++) {
        const dir = allDirs[i];
        const rawPath = ScrapDirection(matrix, 0, 3, x, y, dir);
        const path = Standarize(matrix[x][y] == 1 ? "Black" : "White", rawPath);

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
 * @param {(0 | 1 | 2)[18][18]} matrix 
 * @param {1 | 2} turn 
 * @param {number} x 
 * @param {number} y 
 * @returns {boolean}
 */
function WillSetupACapture(matrix, turn, x, y) {
    const allDirs = Object.keys(DirectionMirror);
    matrix[x][y] = turn;
    for (let i = 0; i < allDirs.length; i++) {
        const dir = allDirs[i];
        const rawPath = ScrapDirection(matrix, 0, 3, x, y, dir);
        const path = Standarize(matrix[x][y] == 1 ? "Black" : "White", rawPath);
        if (path == "XOO.") {
            let ecl = MoveDirection(dir, x, y)
            ecl = MoveDirection(dir, ecl.x, ecl.y)
            ecl = MoveDirection(dir, ecl.x, ecl.y)
            if (!IsValidMoveFor1337Mode(matrix, turn, ecl.x, ecl.y)) {
                return false
            }
            return true;
        }
    }


    return false;
}
/**
 * 
 * @param {(0 | 1 | 2)[18][18]} matrix 
 * @param {1 | 2} turn 
 * @param {number} x 
 * @param {number} y 
 * @returns {boolean}
 */
function WillBeCaptured(matrix, turn, x, y) {
    const allDirs = Object.keys(DirectionMirror);
    matrix[x][y] = turn;
    for (let i = 0; i < allDirs.length; i++) {
        const dir = allDirs[i];
        const rawPath = ScrapDirection(matrix, 2, 1, x, y, dir);
        const path = Standarize(matrix[x][y] == 1 ? "Black" : "White", rawPath);

        if (/OXX\./.test(path) || /\.XXO/.test(path)) {
            // matrix[x][y] = 0;
            if (/OXX\./.test(path)) {
                let ecl = MoveDirection(dir, x, y)
                if (!IsValidMoveFor1337Mode(matrix, turn, ecl.x, ecl.y)) {
                    return false
                }
            } else {
                let ecl = MoveDirection(DirectionMirror[dir], x, y)
                ecl = MoveDirection(DirectionMirror[dir], ecl.x, ecl.y)
                if (!IsValidMoveFor1337Mode(matrix, turn, ecl.x, ecl.y)) {
                    return false
                }
            }
            return true;
        }
    }

    // matrix[x][y] = 0;
    return false;
}
/**
 * 
 * @param {"Black" | "White"} turn 
 * @param {string} row 
 * @returns {string} convert raw row with 0,1,2 to one standard form, e.g : [(turn of 1) 00122100 -> ..XOOX..]
 *                                                                          [(turn of 2) 00122100 -> ..OXXO..]
 */
function Standarize(turn, row) {
    return row.split("").map(c => {
        if (turn == "Black") {
            if (c == "1") {
                c = "X"
            } else if (c == "2") {
                c = "O"
            } else {
                c = "."
            }
        } else {
            if (c == "2") {
                c = "X"
            } else if (c == "1") {
                c = "O"
            } else {
                c = "."
            }
        }

        return c
    }).join("");
}
/**
 * 
 * @param {(0 | 1 | 2)[18][18]} matrix 
 * @param {-1 | number} nLeft 
 * @param {-1 | number} nRight 
 * @param {number} x 
 * @param {number} y 
 * @param {keyof DirectionMirror} direction 
 * @returns {string} scrap n pieces from the both sides of the 'direction' given, if nLeft or nRight equals to -1, full row will be scrapped
 */
function ScrapDirection(matrix, nLeft, nRight, x, y, direction) {
    nLeft = nLeft == -1 ? matrix.length : nLeft
    nRight = nRight == -1 ? matrix.length : nRight

    let [leftSide, rightSide] = ["", ""]
    const mirrorDir = DirectionMirror[direction]
    let coord = MoveDirection(mirrorDir, x, y)

    while (nLeft && ValidXY(matrix.length, coord.x, coord.y)) {
        leftSide += matrix[coord.x][coord.y]
        coord = MoveDirection(mirrorDir, coord.x, coord.y)
        nLeft--
    }

    coord = MoveDirection(direction, x, y)
    while (nRight && ValidXY(matrix.length, coord.x, coord.y)) {
        rightSide += matrix[coord.x][coord.y]
        coord = MoveDirection(direction, coord.x, coord.y)
        nRight--
    }

    return leftSide.split("").reverse().join("") + matrix[x][y] + rightSide
}
/**
 * 
 * @param {(0 | 1 | 2)[18][18]} matrix 
 * @param {number} x 
 * @param {number} y 
 * @param {1 | 2} turn
 * @returns
 */
function EvalPiece(matrix, x, y, turn) {
    const allDirs = Object.keys(DirectionMirror);
    const size = matrix.length;
    const repport = {
        isWin: false,
        score: 0,
        isDoubleFour: false
    };
    // if (!IsValidMoveFor1337Mode(matrix, turn, x, y)) {
    //     return repport
    // }

    for (let i = 0; i < 4; i++) {
        const dir = allDirs[i];
        repport[dir] = {
            consecutives: 0,
            bounds: 0,
        };
        let coord = MoveDirection(dir, x, y);
        while (1) {
            if (!ValidXY(size, coord.x, coord.y)) {
                repport[dir].bounds++;
                break
            }
            const cell = matrix[coord.x][coord.y];
            if (cell != turn && cell != 0) {
                repport[dir].bounds++;
                break;
            } else if (cell == 0) {
                break;
            }

            repport[dir].consecutives++;
            coord = MoveDirection(dir, coord.x, coord.y)
        }

        coord = MoveDirection(DirectionMirror[dir], x, y);
        while (1) {
            if (!ValidXY(size, coord.x, coord.y)) {
                repport[dir].bounds++;
                break
            }
            const cell = matrix[coord.x][coord.y];
            if (cell != turn && cell != 0) {
                repport[dir].bounds++;
                break;
            } else if (cell == 0) {
                break;
            }

            repport[dir].consecutives++;
            coord = MoveDirection(DirectionMirror[dir], coord.x, coord.y)
        }

        repport.score += GetScore(repport[dir].consecutives, repport[dir].bounds);
        if (repport[dir].consecutives >= 4) {
            repport.isWin = true;
            break
        }

        if (repport[dir].consecutives >= 3 && repport[dir].bounds == 0) {
            repport.isDoubleFour = true;
        }

    }

    return repport
}
/**
 * 
 * @param {number} count 
 * @param {number} bound 
 * @returns {number} return score based on total of consecutives and bounds
 */
function GetScore(count, bound) {
    let score = 0
    if (count >= 4) {
        if (bound > 0) {
            score += 5000;
        }
        else {
            score += 10000;
        }
    }
    else if (count == 3) {
        if (bound > 0) {
            score += 500;
        }
        else {
            score += 1000;
        }
    }
    else if (count == 2) {
        if (bound > 0) {
            score += 50;
        }
        else {
            score += 500;
        }
    }
    else if (count == 1) {
        if (bound > 0) {
            score += 5;
        }
        else {
            score += 200;
        }
    }
    return score
}
/**
 * 
 * @param {(0 | 1 | 2)[18][18]} matrix 
 * @param {1 | 2} turn 
 * @param {'1337' | 'Normal'} mode 
 * @returns 
 */
function FindValidSpots(matrix, turn, mode) {
    const cells = [];
    const allDirs = Object.keys(DirectionMirror);
    const size = matrix.length
    for (i = 0; i < size; i++) {

        for (j = 0; j < size; j++) {
            if (matrix[i][j] == 0) {

                for (let k = 0; k < allDirs.length; k++) {
                    const dir = allDirs[k];
                    let coord = MoveDirection(dir, i, j);

                    if (ValidXY(size, coord.x, coord.y) && matrix[coord.x][coord.y] != 0) {
                        let valid = true

                        if (mode == "1337") {
                            if (!(IsValidMoveFor1337Mode(matrix, turn, i, j))) {
                                valid = false
                            }
                        }

                        cells.push({ x: i, y: j, valid })
                        break
                    }
                }
            }
        }
    }
    return cells
}
/**
 * 
 * @param {(0 | 1 | 2)[18][18]} matrix 
 * @param {1 | 2} turn 
 * @param {number} x 
 * @param {number} y 
 * @returns {boolean}
 */
function IsValidMoveFor1337Mode(matrix, turn, x, y) {
    return !IsInCapture(copyMat(matrix), turn, x, y) && !IsDoubleFreeThree(copyMat(matrix), turn, x, y)
}

function copyMat(matrix) {
    return JSON.parse(JSON.stringify(matrix))
}
/**
 * 
 * @param {(0 | 1 | 2)[18][18]} matrix 
 * @param {1 | 2} turn 
 * @param {'1337' | 'Normal'} mode 
 * @returns 
 */
function AnalyseMoves(matrix, turn, mode) {
    let mvs = [{
        x: 0,
        y: 0,
        score: 0,
        isWin: false,
        isDouble4: false,
        isCapture: false,
        willBeCaptured: false,
        willSetupACapture: false,
        willBlockACapture: false,
        willBlockWin: false,
        willBlockADouble4: false,
        isBestMoveByScore: false
    }]
    mvs = FindValidSpots(matrix, turn, mode)

    let offensvieMove = new Point(0, 0, -Infinity)
    let deffensiveMove = new Point(0, 0, -Infinity)
    let oindex = 0
    let dindex = 0

    mvs.forEach((mv, i) => {
        if (mv.valid) {
            matrix[mv.x][mv.y] = turn
            const eval = EvalPiece(matrix, mv.x, mv.y, turn)
            mv.score = eval.score
            mv.isWin = eval.isWin
            mv.isDouble4 = eval.isDoubleFour
            mv.isCapture = !!IsCapture(copyMat(matrix), mv.x, mv.y)?.length || false
            mv.willBeCaptured = WillBeCaptured(copyMat(matrix), turn, mv.x, mv.y)
            mv.willSetupACapture = WillSetupACapture(copyMat(matrix), turn, mv.x, mv.y)

            if (mode == "1337" && IsValidMoveFor1337Mode(matrix, 3 - turn, mv.x, mv.y)) {

                matrix[mv.x][mv.y] = 3 - turn

                mv.willBlockACapture = !!IsCapture(copyMat(matrix), mv.x, mv.y)
                matrix[mv.x][mv.y] = 0

                const enemEval = EvalPiece(matrix, mv.x, mv.y, 3 - turn)
                if (enemEval.isDoubleFour) {
                    mv.willBlockADouble4 = true
                }
                mv.score += enemEval.score
                if (enemEval.isWin) {
                    mv.willBlockWin = true
                }
                if (!WillBeCaptured(copyMat(matrix), 3 - turn, mv.x, mv.y))
                    if (enemEval.score > deffensiveMove.score) {
                        deffensiveMove = new Point(mv.x, mv.y, enemEval.score)
                        dindex = i
                    }

            }
            if (!mv.willBeCaptured)
                if (eval.score > offensvieMove.score) {
                    offensvieMove = new Point(mv.x, mv.y, eval.score)
                    oindex = i
                }

            matrix[mv.x][mv.y] = 0

        }
    })
    if (offensvieMove.score >= deffensiveMove.score) {
        mvs[oindex].isBestMoveByScore = true
    } else {
        mvs[dindex].isBestMoveByScore = true
    }
    return mvs
}   