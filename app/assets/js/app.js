
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
function PutStone(x, y, live) {
  if (GAME.Ended) {
    return
  }


  if (MATRIX[x][y] === 0) {
    let turn = GAME.Turn == "Black" ? 1 : 2;

    if (GAME.Mode == "1337" && (IsInCapture(MATRIX, turn, x, y) || IsDoubleFreeThree(MATRIX, turn, x, y))) {
      myLog(x, y, live, turn, GAME.Turn)
      // return 1872
      alert("Invalid Move (in capture)")
    } else {
      // new Audio('assets/audio/sound-effect.mp3').play()

      MATRIX[x][y] = turn
      MOVES.history.push(alpha[x] + y)
      if (GAME.Mode == "1337") {
        const totalCaptures = findAndApplyCaptures(MATRIX, x, y)
        GAME[GAME.Turn].captures += totalCaptures / 2
      }

      if (GAME[GAME.Turn].captures >= 5 || is5InRowWin(x, y, turn)) {
        GAME.Winner = GAME.Turn
        GAME.Ended = true
        RenderBoard();
        RenderInfos()
        ShowMovesHistory()

        return
      }
      GAME.Turn = GAME.Turn == "Black" ? "White" : "Black"

      RenderBoard();
      RenderInfos()
      ShowMovesHistory()

      ShowValidSpots()

      const aiMove = AI()
      if (live && GAME[GAME.Turn].type == "ai") {

        setTimeout(() => {
          PutStone(aiMove.x, aiMove.y, true)
        }, 10)
        // PutStone(aiMove.x, aiMove.y, true)

      }


    }
    // ShowValidSpots()
  }
}

/**
 * 
 * @returns {Point} return the best move calculated by the AI for current player turn.
 */
function AI() {

  turn = GAME.Turn == "Black" ? 1 : 2;
  console.clear();
  const enemyColor = GAME.Turn == "Black" ? "White" : GAME.Turn
  const moves = AnalyseMoves(MATRIX, turn, GAME.Mode)
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
  const isOpenThree = moves.filter(m => m.isOpenThree).sort((a, b) => b.score - a.score)

  const willBlockACapture = moves.filter(m => m.willBlockACapture).sort((a, b) => b.score - a.score)
  // const willBeCaptured = moves.find(m => m.willBeCaptured)

  const willSetupACapture = moves.filter(m => m.willSetupACapture && !m.willBeCaptured).sort((a, b) => b.score - a.score)
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
    myLog(`c1:`)
    bestMove.x = isCapture[0].x
    bestMove.y = isCapture[0].y
    ShowBestMove(isCapture[0])

  } else if (winMove.length) {
    myLog(`c2:`)
    bestMove.x = winMove[0].x
    bestMove.y = winMove[0].y
    ShowBestMove(bestMove)

  } else if (GAME[enemyColor].captures >= 4 && willBlockACapture.length) {
    myLog(`c3:`)
    const move = willBlockACapture.find(m => m.willBlockWin) || willBlockACapture[0]
    bestMove.x = move.x
    bestMove.y = move.y
    ShowBestMove(move)

  } else if (blockWinMove.length) {
    myLog(`c4:`)
    bestMove.x = blockWinMove[0].x
    bestMove.y = blockWinMove[0].y
    ShowBestMove(bestMove)

  } else if (willBlockADouble4.length) {
    myLog(`c5:`)
    const move = willBlockADouble4.find(m => !m.willBeCaptured) || willBlockADouble4[0] // 
    bestMove.x = move.x
    bestMove.y = move.y
    ShowBestMove(move)

  } else if (isCapture.length && isCapture.find(m => !m.willBeCaptured)) {
    myLog(`c6:`)
    const move = isCapture.find(m => !m.willBeCaptured)
    bestMove.x = move.x
    bestMove.y = move.y
    ShowBestMove(move)

  } else if (isOpenFour.length) {
    myLog(`c7:`)
    bestMove.x = isOpenFour[0].x
    bestMove.y = isOpenFour[0].y
    ShowBestMove(bestMove)

  } else if (willBlockACapture.length) {
    myLog(`c8:`)
    bestMove.x = willBlockACapture[0].x
    bestMove.y = willBlockACapture[0].y
    ShowBestMove(bestMove)

  } else if (willSetupACapture.length) {
    myLog(`c9:`)
    bestMove.x = willSetupACapture[0].x
    bestMove.y = willSetupACapture[0].y
    ShowBestMove(bestMove)

  } else if (isOpenThree.length && bestMoveByScore[0]) {
    myLog(`c10:`)
    bestMove.x = isOpenThree[0].x
    bestMove.y = isOpenThree[0].y
    ShowBestMove(bestMove)
  } else {
    myLog(`c11:`)
    bestMove.x = bestMoveByScore[0].x
    bestMove.y = bestMoveByScore[0].y
    ShowBestMove(bestMove)
  }

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

