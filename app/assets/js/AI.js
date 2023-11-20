
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
        captures: [],
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

    // const validMoves = mvs.filter(l => l.valid).map(m => `${m.x}.${m.y}`).join("_")

    // const mvsEnemy = FindValidSpots(matrix, turn2, mode);
    // const validEnemyMoves = mvsEnemy.filter(l => l.valid).map(m => `${m.x}.${m.y}`).join("_")
    // const baseMatrix = MaskForbiddenSpotsAsEnemyStones(copyMat(matrix), turn, validMoves);
    // const baseEnemyMatrix = MaskForbiddenSpotsAsEnemyStones(copyMat(matrix), turn2, validEnemyMoves)
    for (let i = 0; i < mvs.length; i++) {
        let mv = mvs[i]
        if (!mv.valid) {

        } else {
            let board = copyMat(matrix);
            let board2 = copyMat(matrix);

            if (mode == "1337") {
                board[mv.x][mv.y] = turn;
                const captures = findAndApplyCaptures(board, mv.x, mv.y)
                mv.isCapture = captures.length > 0
                mv.captures = captures
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
                    mv.willBlockACapture = captures.length > 0
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

/**
 * 
 * @returns {Point | undefined} return the best move calculated by the AI for current player turn.
 */
function AI(turn) {
    let start = performance.now();
    const enemyColor = (3 - turn) == 1 ? "Black" : "White"
    let pickedMoveStr = ''
    const moves = AnalyseMoves(MATRIX, turn, GAME.Mode)
    if (!moves.length) {
        return undefined
    }

    const bestMoveByScore = moves.filter(m => m.isBestMoveByScore);
    const bestMove = new Point(0, 0, 0);
    bestMove.x = bestMoveByScore[0].x;
    bestMove.y = bestMoveByScore[0].y;
    if (GAME.validMovesToBreakWin) {
        console.log("===========>", GAME.validMovesToBreakWin)
        bestMove.reason = myLog(`:break win row with capture:`)
        let move = GAME.validMovesToBreakWin.sort((a, b) => b.captures.length - a.captures.length || b.score - a.score || b.hisScore - a.hisScore)
        move = move.find(m => m.isWin)
            || move.find(m => m.willBlockWin)
            || move.find(m => m.isOpenFour)
            || move.find(m => m.isOpenThree)
            || move.find(m => m.willBlockADouble4)
            || move.find(m => m.willBlockACapture)
            || move.find(m => m.willSetupACapture)
            || move.find(m => m.isBestMoveByScore)
            || move[0]

        bestMove.x = move.x
        bestMove.y = move.y
        ShowBestMove(bestMove)
        return bestMove
    }

    if (GAME.Mode == "normal") {
        ShowBestMove(bestMove)
        return bestMove
    }

    const winMove = moves.filter(m => m.isWin)
    const blockWinMove = moves.filter(m => m.willBlockWin).sort((a, b) => b.score - a.score)
    const isCapture = moves.filter(m => m.isCapture).sort((a, b) => b.score - a.score)
    const isOpenFour = moves.filter(m => m.isOpenFour).sort((a, b) => b.score - a.score)
    const isOpenThree = moves.filter(m => m.isOpenThree && !m.willBeCaptured).sort((a, b) => b.score - a.score)
    const willBlockACapture = moves.filter(m => m.willBlockACapture && !m.willBeCaptured).sort((a, b) => b.score - a.score)
    const willBlockADouble4 = moves.filter(m => m.willBlockADouble4).sort((a, b) => b.score - a.score)

    const willSetupACapture = [
        ...moves.filter(m =>
            m.willSetupACapture &&
            !m.willBeCaptured).sort((a, b) => b.score - a.score),
        ...moves.filter(m =>
            m.willSetupACapture &&
            m.willBeCaptured && m.isOpenThree)
    ]

    myLog(moves);
    myLog("Win Move: ", winMove);
    myLog("Anti Win Move: ", blockWinMove);
    myLog("Capture Move: ", isCapture);
    myLog("Double 4 Move: ", isOpenFour);
    myLog("Will Block a Capture: ", willBlockACapture);
    myLog("Will setup capture: ", willSetupACapture);
    myLog("Will block double 4: ", willBlockADouble4);
    myLog("Best Move by Score: ", bestMoveByScore);

    choose_move(moves, {
        winMove,
        blockWinMove,
        isCapture,
        isOpenFour,
        isOpenThree,
        willBlockACapture,
        willBlockADouble4,
        willSetupACapture
    }, enemyColor, bestMove, bestMoveByScore, pickedMoveStr)
    console.log(bestMove, ScrapLargeLine(MATRIX, 3 - turn, bestMove.x, bestMove.y))

    let timeTaken = performance.now() - start;

    $('#moves_suggestions').val(
        `
Player: ${GAME.Turn}
Type: ${GAME[GAME.Turn].type}
Win Move: ${winMove.length}
${winMove.map(m => '- ' + alpha[m.x] + '' + m.y).join('\n')}
Anti Win Move: ${blockWinMove.length}
${blockWinMove.map(m => '- ' + alpha[m.x] + '' + m.y).join('\n')}
Capture Move: ${isCapture.length}
${isCapture.map(m => '- ' + alpha[m.x] + '' + m.y).join('\n')}
Double 4 Move: ${isOpenFour.length}
${isOpenFour.map(m => '- ' + alpha[m.x] + '' + m.y).join('\n')}
Will Block a Capture: ${willBlockACapture.length}
${willBlockACapture.map(m => '- ' + alpha[m.x] + '' + m.y).join('\n')}
Will setup capture: ${willSetupACapture.length}
${willSetupACapture.map(m => '- ' + alpha[m.x] + '' + m.y).join('\n')}
Will block double 4: ${willBlockADouble4.length}
${willBlockADouble4.map(m => '- ' + alpha[m.x] + '' + m.y).join('\n')}
Best Move by Score: ${alpha[bestMove.x] + '' + bestMove.y}
------- ------- ------- ------- 
'LHAJ GO' choose : ${alpha[bestMove.x] + '' + bestMove.y} 
-> reason: (${bestMove.reason})
------- ------- ------- -------
Time needed to think :${timeTaken} ms.
`.split("\n").filter(l => l).join("\n")
    )
    return bestMove

}

function choose_move(moves, {
    winMove,
    blockWinMove,
    isCapture,
    isOpenFour,
    isOpenThree,
    willBlockACapture,
    willBlockADouble4,
    willSetupACapture
}, enemyColor, bestMove, bestMoveByScore) {

    if (isCapture.length && GAME[GAME.Turn].captures >= 4) {
        bestMove.reason = myLog(`:Sigma Capture:`)
        bestMove.x = isCapture[0].x
        bestMove.y = isCapture[0].y
        ShowBestMove(bestMove)
        return bestMove
    }

    if (winMove.length) {
        bestMove.reason = myLog(`:Sigma Move:`)
        bestMove.x = winMove[0].x
        bestMove.y = winMove[0].y
        ShowBestMove(bestMove)
        return bestMove
    }

    if (GAME[enemyColor].captures >= 4 && willBlockACapture.length) {
        bestMove.reason = myLog(`:block 5th enemy capture:`)
        const move = willBlockACapture.find(m => m.willBlockWin) || willBlockACapture[0]
        bestMove.x = move.x
        bestMove.y = move.y
        ShowBestMove(bestMove)
    }

    if (blockWinMove.length) {
        bestMove.reason = myLog(`:block win move:`)
        bestMove.x = blockWinMove[0].x
        bestMove.y = blockWinMove[0].y
        ShowBestMove(bestMove)
        return bestMove
    }

    if (willBlockADouble4.length) {
        bestMove.reason = myLog(`:block double 4:`)
        let move = moves.filter(m => m.isCapture && m.willBlockADouble4).sort((a, b) => b.score - a.score)
        if (!move.length) {
            move = willBlockADouble4.find(m => !m.willBeCaptured) || willBlockADouble4[0] // 
        } else {
            move = move.find((m) => !m.willBeCaptured) || move[0]
        }

        bestMove.x = move.x
        bestMove.y = move.y
        ShowBestMove(bestMove)
        return bestMove
    }

    if (isOpenFour.length) {
        bestMove.reason = myLog(`:open 4:`)
        bestMove.x = isOpenFour[0].x
        bestMove.y = isOpenFour[0].y
        ShowBestMove(bestMove)
        return bestMove
    }

    if (isCapture.length && isCapture.find(m => !m.willBeCaptured)) {
        bestMove.reason = myLog(`:safe capture:`)
        let move = isCapture.find(m => !m.willBeCaptured && m.isOpenThree)

        if (!move) {
            move = isCapture.find(m => !m.willBeCaptured)
        }

        bestMove.x = move.x
        bestMove.y = move.y
        ShowBestMove(bestMove)
        return bestMove
    }

    if (willSetupACapture.find((m => m.isOpenThree && !m.willBeCaptured))) {
        bestMove.reason = myLog(`:setup capt + openThree:`)
        const move = willSetupACapture.find((m => m.isOpenThree && !m.willBeCaptured))
        bestMove.x = move.x
        bestMove.y = move.y
        ShowBestMove(bestMove)
        return bestMove
    }

    if (willBlockACapture.length) {
        bestMove.reason = myLog(`:block capture:`)
        bestMove.x = willBlockACapture[0].x
        bestMove.y = willBlockACapture[0].y
        ShowBestMove(bestMove)
        return bestMove
    }

    if (willSetupACapture.find(m => !m.willBeCaptured)) {
        bestMove.reason = myLog(`:will setup capture:`)
        const move = willSetupACapture.find((m => !m.willBeCaptured))
        bestMove.x = move.x
        bestMove.y = move.y
        ShowBestMove(bestMove)
        return bestMove
    }

    if (isOpenThree.length) {
        bestMove.reason = myLog(`:open 3:`)
        bestMove.x = isOpenThree[0].x
        bestMove.y = isOpenThree[0].y
        ShowBestMove(bestMove)
        return bestMove
    }

    bestMove.reason = myLog(`:best score:`)
    bestMove.x = bestMoveByScore[0].x
    bestMove.y = bestMoveByScore[0].y
    ShowBestMove(bestMove)
    return bestMove
}

function choose_move_backup(moves, {
    winMove,
    blockWinMove,
    isCapture,
    isOpenFour,
    isOpenThree,
    willBlockACapture,
    willBlockADouble4,
    willSetupACapture
}, enemyColor, bestMove, bestMoveByScore, pickedMoveStr) {
    if (isCapture.length && GAME[GAME.Turn].captures >= 4) {
        bestMove.reason = myLog(`:Sigma Capture:`)
        bestMove.x = isCapture[0].x
        bestMove.y = isCapture[0].y
        ShowBestMove(isCapture[0])

    } else if (winMove.length) {
        bestMove.reason = myLog(`:Sigma Move:`)
        bestMove.x = winMove[0].x
        bestMove.y = winMove[0].y
        ShowBestMove(bestMove)

    } else if (GAME[enemyColor].captures >= 4 && willBlockACapture.length) {
        bestMove.reason = myLog(`:block 5th enemy capture:`)
        const move = willBlockACapture.find(m => m.willBlockWin) || willBlockACapture[0]
        bestMove.x = move.x
        bestMove.y = move.y
        ShowBestMove(move)

    } else if (blockWinMove.length) {
        bestMove.reason = myLog(`:block win move:`)
        bestMove.x = blockWinMove[0].x
        bestMove.y = blockWinMove[0].y
        ShowBestMove(bestMove)

    } else if (willBlockADouble4.length) {
        bestMove.reason = myLog(`:block double 4:`)
        let move = moves.filter(m => m.isCapture && m.willBlockADouble4).sort((a, b) => b.score - a.score)
        if (!move.length) {
            move = willBlockADouble4.find(m => !m.willBeCaptured) || willBlockADouble4[0] // 
        } else {
            move = move.find((m) => !m.willBeCaptured) || move[0]
        }

        bestMove.x = move.x
        bestMove.y = move.y
        ShowBestMove(move)

    } else if (isOpenFour.length) {
        bestMove.reason = myLog(`:open 4:`)
        bestMove.x = isOpenFour[0].x
        bestMove.y = isOpenFour[0].y
        ShowBestMove(bestMove)

    } else if (isCapture.length && isCapture.find(m => !m.willBeCaptured)) {
        bestMove.reason = myLog(`:safe capture:`)
        let move = isCapture.find(m => !m.willBeCaptured && m.isOpenThree)

        if (!move) {
            move = isCapture.find(m => !m.willBeCaptured)
        }

        bestMove.x = move.x
        bestMove.y = move.y
        ShowBestMove(move)

    } else if (willSetupACapture.find((m => m.isOpenThree && !m.willBeCaptured))) {
        bestMove.reason = myLog(`:setup capt + openThree:`)
        const move = willSetupACapture.find((m => m.isOpenThree && !m.willBeCaptured))
        bestMove.x = move.x
        bestMove.y = move.y
        ShowBestMove(bestMove)

    } else if (willBlockACapture.length) {
        bestMove.reason = myLog(`:block capture:`)
        bestMove.x = willBlockACapture[0].x
        bestMove.y = willBlockACapture[0].y
        ShowBestMove(bestMove)

    } else if (willSetupACapture.find(m => !m.willBeCaptured)) {
        bestMove.reason = myLog(`:will setup capture:`)
        const move = willSetupACapture.find((m => !m.willBeCaptured))
        bestMove.x = move.x
        bestMove.y = move.y
        ShowBestMove(bestMove)

    } else if (isOpenThree.length) {
        bestMove.reason = myLog(`:open 3:`)
        bestMove.x = isOpenThree[0].x
        bestMove.y = isOpenThree[0].y
        ShowBestMove(bestMove)

    } else {
        bestMove.reason = myLog(`:best score:`)
        bestMove.x = bestMoveByScore[0].x
        bestMove.y = bestMoveByScore[0].y
        ShowBestMove(bestMove)
    }
    return pickedMoveStr
}