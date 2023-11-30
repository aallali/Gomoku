
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
        const totalCaptures = findAndApplyCaptures(board, x, y).length
        captures += totalCaptures / 2
      }
      valid = true
    }
  }

  return { valid, board, captures }
}

/**
 * Reset all States of the game
 * - reset captures and score of the players
 * - reset the value of winner
 * - reset the player turn to default
 * - empty the suggested moves
 */
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
    GAME.validMovesToBreakWin = undefined
    let myColor = GAME.Turn;
    let hisColor = myColor == "Black" ? "White" : "Black";

    let myVal = myColor == "Black" ? 1 : 2;
    let hisVal = 3 - myVal;

    if (GAME.Mode == "1337" && (IsInCapture(MATRIX, myVal, x, y) || IsDoubleFreeThree(MATRIX, myVal, x, y)))
      return;

    let stoneSound = new Audio('assets/audio/sound-effect.mp3')
    stoneSound.play()
    MATRIX[x][y] = myVal
    MOVES.history.push(alpha[x] + y)
    if (GAME.Mode == "1337") {
      const totalCaptures = findAndApplyCaptures(MATRIX, x, y)
      if (totalCaptures.length) {
   
        const blinker = setInterval(function () {
          totalCaptures.forEach(el => {
            $(`#cross${el.x}r${el.y}c`).toggleClass('blink_capture')
          });
      }, 200)
        await blok(2)
        clearInterval(blinker)
        totalCaptures.forEach(el => {
          $(`#cross${el.x}r${el.y}c`).removeClass('blink_capture')
        });
        GAME[myColor].captures += totalCaptures.length / 2
      }

    }

    UpdateBoard();
    ShowMovesHistory();

    if (CheckWin(hisColor, myColor, hisVal, myVal, GAME.Mode, x, y)) {
      return
    }

    GAME.Turn = GAME.Turn == "Black" ? "White" : "Black"
    RenderInfos()

    if (CheckTie()) {
      return
    }
    await blok(0.1)
    // stoneSound.pause()
    const aiMove = AI(hisVal)
    if (live && GAME[GAME.Turn].type == "ai") {
      await blok(0.01)
      PutStone(aiMove.x, aiMove.y, true)
    }

  }
  
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

