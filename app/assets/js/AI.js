
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
        isOpenFour: false
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
            repport.isOpenFour = true;
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
function AnalyseMoves(matrix, turn, mode) {
    let mvs = [{
        x: 0,
        y: 0,
        score: 0,
        isWin: false,
        isOpenFour: false,
        isOpenThree: false,
        isCapture: false,
        willBeCaptured: false,
        willSetupACapture: false,
        willBlockACapture: false,
        willBlockWin: false,
        willBlockADouble4: false,
        isBestMoveByScore: false
    }]
    mvs = FindValidSpots(matrix, turn, mode);


    if (!mvs.length) {
        return []
    }
    const turn2 = 3 - turn
    const offensiveMove = new Point(0, 0, -Infinity);
    const deffensiveMove = new Point(0, 0, -Infinity);
    let oindex = 0;
    let dindex = 0;

    const validMoves = mvs.filter(l => l.valid).map(m => `${m.x}.${m.y}`).join("_")

    const mvsEnemy = FindValidSpots(matrix, turn2, mode);
    const validEnemyMoves = mvsEnemy.filter(l => l.valid).map(m => `${m.x}.${m.y}`).join("_")
    const baseMatrix = MaskForbiddenSpotsAsEnemyStones(copyMat(matrix), turn, validMoves);
    const baseEnemyMatrix = MaskForbiddenSpotsAsEnemyStones(copyMat(matrix), turn2, validEnemyMoves)
    for (let i = 0; i < mvs.length; i++) {
        let mv = mvs[i]
        if (!mv.valid) {

        } else {
            let board = copyMat(matrix);
            let board2 = copyMat(matrix);

            if (mode == "1337") {
                board[mv.x][mv.y] = turn;
                const captures = findAndApplyCaptures(board, mv.x, mv.y)
                mv.isCapture = captures > 0
                mv.willBeCaptured = WillBeCaptured(copyMat(board), turn, mv.x, mv.y);
                mv.willSetupACapture = WillSetupACapture(copyMat(board), turn, mv.x, mv.y);
                // board = copyMat(baseMatrix)
                const eval = EvalPiece(board, mv.x, mv.y, turn);
                board = copyMat(matrix);
                board[mv.x][mv.y] = turn;
                mv.score = eval.score;
                mv.isWin = eval.isWin;
                mv.isOpenFour = eval.isOpenFour;
                mv.isOpenThree = IsOpenThree(copyMat(board), turn, mv.x, mv.y);

                mv.valid4Enemy = false;
                // console.log("::->", mv.x, mv.y, mv.score, eval.score)


                if (IsValidMoveFor1337Mode(board2, turn2, mv.x, mv.y)) {
                    mv.valid4Enemy = true
                    board2[mv.x][mv.y] = turn2
                    const captures = findAndApplyCaptures(board2, mv.x, mv.y)
                    mv.willBlockACapture = captures > 0
                    // board2 = copyMat(baseEnemyMatrix)
                    const enemEval = EvalPiece(board2, mv.x, mv.y, turn2)
                    mv.hisScore = enemEval.score
                    if (enemEval.isOpenFour) {
                        mv.willBlockADouble4 = true
                    }
                    if (enemEval.isWin) {
                        mv.willBlockWin = true
                    }
                    // mv.score += enemEval.score

                    if (enemEval.score > deffensiveMove.score && !mv.willBeCaptured) {
                        if (!WillBeCaptured(copyMat(matrix), turn2, mv.x, mv.y)) {
                            deffensiveMove.x = mv.x;
                            deffensiveMove.y = mv.y;
                            deffensiveMove.score = enemEval.score;
                            dindex = i
                        }
                    }
                }

                if (!mv.willBeCaptured) {
                    if (mv.score > offensiveMove.score) {
                        offensiveMove.x = mv.x;
                        deffensiveMove.y = mv.y;
                        offensiveMove.score = mv.score;
                        oindex = i
                    }
                }


            } else {
                const eval = EvalPiece(board, mv.x, mv.y, turn)
                mv.score = eval.score 
                mv.isWin = eval.isWin
                if (mv.isWin) {
                    mv.isBestMoveByScore = true
                    return [mv]
                }
                if (mv.score > offensiveMove.score) {
                    offensiveMove.x = mv.x;
                    offensiveMove.y = mv.y;
                    offensiveMove.score = mv.score;
                    oindex = i;
                }
                
                const enemyEval = EvalPiece(board, mv.x, mv.y, turn2)
                if (enemyEval.score > deffensiveMove.score) {
                    deffensiveMove.x = mv.x;
                    deffensiveMove.y = mv.y;
                    deffensiveMove.score = enemyEval.score;
                    dindex = i;
                }
              
            }

        }

    }
    // mvs[oindex].isBestMoveByScore = true;

    if (offensiveMove.score >= deffensiveMove.score) {
        mvs[oindex].isBestMoveByScore = true;
    } else {
        mvs[dindex].isBestMoveByScore = true;
    }

    mvs.sort((a, b) => b.score - a.score)



    return mvs
}