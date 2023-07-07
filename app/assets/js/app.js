
/**
 * 
 * @param {string} option 
 * @param {string} value 
 */
function SetOptions(option, value) {

  switch (option) {
    case "game_mode":
      GAME.Mode = value
      break
    case "black":
      GAME.Black.type = value
      break
    case "white":
      GAME.White.type = value
      break
    default:
      break
  }
  myLog(option, value, GAME)

}
/**
 * 
 * @param {string} stringMove 
 * @returns {Point} convert move from string format to object: J9 -> {x:9, y:9}
 */
function ConvertMoveFormat(stringMove) {
  return {
    x: alpha.indexOf(stringMove[0]),
    y: parseInt(stringMove[1] + (stringMove[2] || ''))
  }
}

/**
 * 
 * @param {Point} moves 
 * @returns return a board copy where the moves are applied + result of captures and current turn
 */
function ApplyMoves(moves) {

  let board = []
  let captures = {
    "Black": 0,
    "White": 0
  };
  let GameTurn = "Black";
  for (var i = 0; i < GAME.Size; i++) {
    board[i] = [];
    for (var j = 0; j < GAME.Size; j++) {
      board[i][j] = 0;
    }
  }

  for (let i = 0; i < moves.length; i++) {
    const { x, y } = ConvertMoveFormat(moves[i])
    const turn = GameTurn == "Black" ? 1 : 2;
    const { valid, board: newBoard, captures: totalCaptures } = ApplyMove(board, turn, { x, y }, GAME.Mode)

    if (valid) {
      board = newBoard
      captures[GameTurn] += totalCaptures
      GameTurn = GameTurn == "Black" ? "White" : "Black"
    } else {
      myLog("Bad Move: ", x, y);
    }
  }
  return { board, captures, turn: GameTurn }
}
/**
 * 
 * @param {*} matrix 
 * @param {*} turn 
 * @param {*} param2 : {x:number, y:number}
 * @param {*} mode 
 * @returns 
 */
function ApplyMove(matrix, turn, { x, y }, mode) {

  const board = copyMat(matrix)
  let captures = 0
  let valid = false
  if (board[x][y] === 0) {
    if (mode == "1337" && (IsInCapture(board, turn, x, y) || IsDoubleFreeThree(board, turn, x, y))) {
      // return 1872
      alert("Invalid Move (in capture)")
    } else {
      board[x][y] = turn
      if (mode == "1337") {
        const totalCaptures = findAndApplyCaptures(board, x, y)
        captures += totalCaptures / 2
      }
      valid = true
    }
  }

  return { valid, board, captures }
}
function ResetStates() {
  GAME.Black = {
    type: GAME.Black.type,
    captures: 0,
    score: 0
  }
  GAME.White = {
    type: GAME.White.type,
    captures: 0,
    score: 0
  }

  GAME.Winner = false // black | white
  GAME.Turn = "Black"

  // MATRIX = []
  // MOVES.history = []
  MOVES.suggested = []
}

/**
 * 
 * @param {number} x 
 * @param {number} y 
 * @param {boolean} live 
 * @returns put stone at given x,y if its valid for current player.
 */
async function PutStone(x, y, live) {
  if (GAME.Ended) {
    return
  }


  if (MATRIX[x][y] === 0) {
    let turn = GAME.Turn == "Black" ? 1 : 2;

    if (GAME.Mode == "1337" && (IsInCapture(MATRIX, turn, x, y) || IsDoubleFreeThree(MATRIX, turn, x, y))) {
      myLog(x, y, live, turn, GAME.Turn)
      // return 1872
      // alert("Invalid Move (in capture)")
      return
    } else {
      // new Audio('assets/audio/sound-effect.mp3').play()

      MATRIX[x][y] = turn
      MOVES.history.push(alpha[x] + y)
      if (GAME.Mode == "1337") {
        const totalCaptures = findAndApplyCaptures(MATRIX, x, y)
        GAME[GAME.Turn].captures += totalCaptures / 2
      }
      const is5Capts = GAME[GAME.Turn].captures >= 5
      const is5InRow = is5InRowWin(x, y, turn)
      UpdateBoard();
      ShowMovesHistory()

      if (is5Capts || is5InRow) {
        console.log(is5Capts, GAME[GAME.Turn])
        GAME.Winner = GAME.Turn
        GAME.Ended = true
        const winBy5Msg = 'aligning 5 pieces in a row'
        const winBy5Captures = 'capturing 5 pairs of the enemy stones'
        let winMsg = ''
        if (is5InRow)
          winMsg += winBy5Msg

        if (is5Capts) {
          if (winMsg.length) {
            winMsg += ' and '
          }
          winMsg += winBy5Captures
        }
        RenderInfos()
        alert(`${GAME.Turn} win by ${winMsg}`)
        return
      }


      GAME.Turn = GAME.Turn == "Black" ? "White" : "Black"

      RenderInfos()

      if (ShowValidSpots() == 0) {
        GAME.Ended = true
        GAME.Winner = 'Tie'

        UpdateBoard();
        RenderInfos()
        setTimeout(() => {
          alert("Game ended in a TIE")

        }, 100)
        return
      }
      const aiMove = AI()

      if (live && GAME[GAME.Turn].type == "ai") {

        await blok(0.0001)
        PutStone(aiMove.x, aiMove.y, true)

      }


    }

  }
}

/**
 * 
 * @returns {Point | undefined} return the best move calculated by the AI for current player turn.
 */
function AI() {
  let start = performance.now();


  turn = GAME.Turn == "Black" ? 1 : 2;
  console.clear();
  const enemyColor = GAME.Turn == "Black" ? "White" : "Black"
  const moves = AnalyseMoves(MATRIX, turn, GAME.Mode)
  if (!moves.length) {
    return undefined
  }
  const bestMoveByScore = moves.filter(m => m.isBestMoveByScore)
  const bestMove = new Point(0, 0, 0)

  if (GAME.Mode == "normal") {
    bestMove.x = bestMoveByScore[0].x
    bestMove.y = bestMoveByScore[0].y
    ShowBestMove(bestMoveByScore[0])
  }

  const winMove = moves.filter(m => m.isWin)
  const blockWinMove = moves.filter(m => m.willBlockWin).sort((a, b) => b.score - a.score)
  const isCapture = moves.filter(m => m.isCapture).sort((a, b) => b.score - a.score)
  const isOpenFour = moves.filter(m => m.isOpenFour).sort((a, b) => b.score - a.score)
  const isOpenThree = moves.filter(m => m.isOpenThree && !m.willBeCaptured).sort((a, b) => b.score - a.score)

  const willBlockACapture = moves.filter(m => m.willBlockACapture && !m.willBeCaptured).sort((a, b) => b.score - a.score)
  // const willBeCaptured = moves.find(m => m.willBeCaptured)

  let willSetupACapture = moves.filter(m => m.willSetupACapture && !m.willBeCaptured).sort((a, b) => b.score - a.score)
  willSetupACapture = [...willSetupACapture, ...moves.filter(m => m.willSetupACapture && m.willBeCaptured && m.isOpenThree)]
  const willBlockADouble4 = moves.filter(m => m.willBlockADouble4).sort((a, b) => b.score - a.score)
  myLog(moves);
  myLog("Win Move: ", winMove);
  myLog("Anti Win Move: ", blockWinMove);
  myLog("Capture Move: ", isCapture);
  myLog("Double 4 Move: ", isOpenFour);
  myLog("Will Block a Capture: ", willBlockACapture);
  myLog("Will setup capture: ", willSetupACapture);
  myLog("Will block double 4: ", willBlockADouble4);
  myLog("Best Move by Score: ", bestMoveByScore);


  if (isCapture.length && GAME[GAME.Turn].captures >= 4) {
    myLog(`:Sigma Capture:`)
    bestMove.x = isCapture[0].x
    bestMove.y = isCapture[0].y
    ShowBestMove(isCapture[0])

  } else if (winMove.length) {
    myLog(`:Sigma Move:`)
    bestMove.x = winMove[0].x
    bestMove.y = winMove[0].y
    ShowBestMove(bestMove)

  } else if (GAME[enemyColor].captures >= 4 && willBlockACapture.length) {
    myLog(`:block 5th enemy capture:`)
    const move = willBlockACapture.find(m => m.willBlockWin) || willBlockACapture[0]
    bestMove.x = move.x
    bestMove.y = move.y
    ShowBestMove(move)

  }
  else if (blockWinMove.length) {
    myLog(`:block win move:`)
    bestMove.x = blockWinMove[0].x
    bestMove.y = blockWinMove[0].y
    ShowBestMove(bestMove)

  } else if (willBlockADouble4.length) {
    myLog(`:block double 4:`)
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
    myLog(`:open 4:`)
    bestMove.x = isOpenFour[0].x
    bestMove.y = isOpenFour[0].y
    ShowBestMove(bestMove)

  } else if (isCapture.length && isCapture.find(m => !m.willBeCaptured)) {
    myLog(`:safe capture:`)
    let move = isCapture.find(m => !m.willBeCaptured && m.isOpenThree)

    if (!move) {
      move = isCapture.find(m => !m.willBeCaptured)

    }

    bestMove.x = move.x
    bestMove.y = move.y
    ShowBestMove(move)
  } else if (willSetupACapture.find((m => m.isOpenThree && !m.willBeCaptured))) {
    myLog(`:setup capt + openThree:`)
    const move = willSetupACapture.find((m => m.isOpenThree && !m.willBeCaptured))
    bestMove.x = move.x
    bestMove.y = move.y
    ShowBestMove(bestMove)
  } else if (willBlockACapture.length) {
    myLog(`:block capture:`)
    bestMove.x = willBlockACapture[0].x
    bestMove.y = willBlockACapture[0].y
    ShowBestMove(bestMove)

  } else if (willSetupACapture.length) {
    myLog(`:will setup capture:`)
    const move = willSetupACapture.find((m => !m.willBeCaptured))
    bestMove.x = move.x
    bestMove.y = move.y
    ShowBestMove(bestMove)

  } else if (isOpenThree.length) {
    myLog(`:open 3:`)
    bestMove.x = isOpenThree[0].x
    bestMove.y = isOpenThree[0].y
    ShowBestMove(bestMove)
  } else {
    myLog(`:best score:`)
    bestMove.x = bestMoveByScore[0].x
    bestMove.y = bestMoveByScore[0].y
    ShowBestMove(bestMove)
  }
  let timeTaken = performance.now() - start;
  console.log("Total time taken : " + timeTaken + " milliseconds");
  return bestMove
}
/**
 * 
 * @param {number} s 
 * @returns blok the process for s seconds
 */
function blok(s) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, s * 1000)
  })
}

/**
 * 
 * @param {number} R : row index
 * @param {number} C : column index
 * @param {1 | 2} player 
 * @returns {boolean} if the player at given move has a 5 in row or not
 */
function is5InRowWin(R, C, player) {
  var mlength = 0;
  var count = 0;
  for (i = 0; i < GAME.Size; i++) {
    if (MATRIX[i][C] == player) {
      count++;
      if (count > mlength) {
        mlength = count;
      }
    } else {
      count = 0;
    }
  }
  count = 0;
  for (i = 0; i < GAME.Size; i++) {
    if (MATRIX[R][i] == player) {
      count++;
      if (count > mlength) {
        mlength = count;
      }
    } else {
      count = 0;
    }
  }
  count = 0;
  for (i = 0; i < GAME.Size; i++) {
    if (R - C + i >= 0 && R - C + i < GAME.Size) {
      if (MATRIX[R - C + i][i] == player) {
        count++;
        if (count > mlength) {
          mlength = count;
        }
      } else {
        count = 0;
      }
    }
  }
  count = 0;
  for (i = 0; i < GAME.Size; i++) {
    if (R + C - i >= 0 && R + C - i < GAME.Size) {
      if (MATRIX[R + C - i][i] == player) {
        count++;
        if (count > mlength) {
          mlength = count;
        }
      } else {
        count = 0;
      }
    }
  }
  if (mlength >= 5) {
    return true
  }
  return false
}

