
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

  RenderInfos()


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

  GAME.Ended = true
  GAME.Winner = false // black | white
  GAME.Turn = "Black"

  MATRIX = []
  MOVES.history = []
  MOVES.suggested = []
}

function RenderInfos() {
  $("#infos_turn").text(GAME.Turn)

  $("#infos_black_captures").text(GAME.Black.captures)
  $("#infos_black_score").text(GAME.Black.score)

  $("#infos_white_captures").text(GAME.White.captures)
  $("#infos_white_score").text(GAME.White.score)
}
function InitBoard() {
  $("#board").empty();
  for (var i = 0; i < GAME.Size; i++) {
    MATRIX[i] = []
    for (var j = 0; j < GAME.Size; j++) {
      MATRIX[i][j] = 0
    }
  }
  const flagsSpots = ["33", "39", "315", "93", "99", "915", "153", "159", "1515"]
  for (var i = 0; i <= GAME.Size + 1; i++) {
    for (var j = 0; j <= GAME.Size + 1; j++) {
      if (i == 0 || j == 0 || j == GAME.Size + 1 || i == GAME.Size + 1) {
        if ((i == 0 && (j == 0 || j == GAME.Size + 1)) || (i == GAME.Size + 1 && (j == 0 || j == GAME.Size + 1))) {
          $("#board").append(`<div class ='empty'></div>`);
        } else if (j == 0) {
          $("#board").append(`<div class='slug'>${alpha[i - 1]}</div>`);
        } else if (j == GAME.Size + 1) {
          $("#board").append(`<div class='slug'>${i - 1}</div>`);

        } else {
          $("#board").append(`<div class='slug'>${j - 1}</div>`);

        }
      } else {
        // myLog(flagsSpots.includes(i+""+j),i+""+j )
        $("#board").append(
          `<div id='cross${i - 1}r${j - 1}c' 
        class='cross ${flagsSpots.includes((i - 1) + "" + (j - 1)) ? "flag" : ""}' 
        onclick='PutStone(${i - 1},${j - 1}, true)' 
        onmouseover='ShowCellsInfo(this,${i - 1},${j - 1})'
        onmouseout='UnShowCellsInfo(this,${i - 1},${j - 1})'>
        <b class="score"></b>
        <i class = 'fa fa-times' aria-hidden='true'></i>

        <img src='assets/images/white-stone.webp' class='circle-white' aria-hidden='true'></img>
        <img src='assets/images/check.png' class='circle-green' aria-hidden='true'></img>
        <img src='assets/images/black-stone.png' class='circle-black' aria-hidden='true'></img>
        <img src='assets/images/green-circle.webp' class='circle-wood' aria-hidden='true'></img>

        </div>`
        );
      }
    }
    $("#board").append("<br>");
  }
}
// green-circle.webp
function ShowCellsInfo(e, i, j) {
  $("#cell_coord").text(`${alpha[i] + j} (${i},${j})`)
}
function UnShowCellsInfo(e, i, j) {
  $("#cell_coord").text(`XY ... (X,Y)`)
}

function PutStone(x, y, live) {
  if (GAME.Ended == true) {
    return
  }

  if (MATRIX[x][y] === 0) {
    let turn = GAME.Turn == "Black" ? 1 : 2;

    if (GAME.Mode == "1337" && (IsInCapture(MATRIX, turn, x, y) || IsDoubleFreeThree(MATRIX, turn, x, y))) {
      myLog(x, y, live, turn, GAME.Turn)
      // return 1872
      alert("Invalid Move (in capture)")
    } else {
      new Audio('assets/audio/sound-effect.mp3').play()

      MATRIX[x][y] = turn
      MOVES.history.push(alpha[x] + y)
      if (GAME.Mode == "1337") {
        const totalCaptures = findAndApplyCaptures(MATRIX, x, y)
        GAME[GAME.Turn].captures += totalCaptures / 2
      }

      if (GAME[GAME.Turn].captures >= 5 || result(x, y, turn)) {
        GAME.Winner = GAME.Turn
        GAME.Ended = true
      }
      // result(x, inj, turn);
      GAME.Turn = GAME.Turn == "Black" ? "White" : "Black"


      update();
      ShowValidSpots()

      if (live && GAME.Mode == "1337" && GAME[GAME.Turn].type == "ai") {

        setTimeout(() => {
          AI()
        }, 1000)
      }


    }
    // ShowValidSpots()
  }
}
function AI() {

  turn = GAME.Turn == "Black" ? 1 : 2;
  // console.clear();
  const enemyColor = GAME.Turn == "Black" ? "White" : GAME.Turn

  const moves = AnalyseMoves(MATRIX, turn, GAME.Mode)
  const winMove = moves.filter(m => m.isWin)
  const blockWinMove = moves.filter(m => m.willBlockWin).sort((a, b) => b.score - a.score)
  const isCapture = moves.filter(m => m.isCapture).sort((a, b) => b.score - a.score)
  const isDouble4 = moves.filter(m => m.isDouble4).sort((a, b) => b.score - a.score)
  const willBlockACapture = moves.filter(m => m.willBlockACapture).sort((a, b) => b.score - a.score)
  // const willBeCaptured = moves.find(m => m.willBeCaptured)
  const bestMoveByScore = moves.filter(m => m.isBestMoveByScore).sort((a, b) => b.score - a.score)
  const willSetupACapture = moves.filter(m => m.willSetupACapture && !m.willBeCaptured).sort((a, b) => b.score - a.score)
  const willBlockADouble4 = moves.filter(m => m.willBlockADouble4).sort((a, b) => b.score - a.score)
  myLog(moves);
  myLog("Win Move: ", winMove);
  myLog("Anti Win Move: ", blockWinMove);
  myLog("Capture Move: ", isCapture);
  myLog("Double 4 Move: ", isDouble4);
  myLog("Will Block a Capture: ", willBlockACapture);
  myLog("Will setup capture: ", willSetupACapture);
  myLog("Will block double 4: ", willBlockADouble4);
  myLog("Best Move by Score: ", bestMoveByScore);
  const bestMove = new Point(0, 0, 0)
  if (isCapture.length && GAME[GAME.Turn].captures >= 4) {
    myLog(`c1:`)
    bestMove.x = isCapture[0].x
    bestMove.y = isCapture[0].y
    ShowBestMove(isCapture[0])

  } else if (winMove.length) {
    myLog(`c2:`)
    bestMove.x = winMove[0].x
    bestMove.y = winMove[0].y
    ShowBestMove(winMove[0])

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
    ShowBestMove(blockWinMove[0])

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

  } else if (isDouble4.length) {
    myLog(`c7:`)
    bestMove.x = isDouble4[0].x
    bestMove.y = isDouble4[0].y
    ShowBestMove(isDouble4[0])

  } else if (willBlockACapture.length) {
    myLog(`c8:`)
    bestMove.x = willBlockACapture[0].x
    bestMove.y = willBlockACapture[0].y
    ShowBestMove(willBlockACapture[0])

  } else if (willSetupACapture.length) {
    myLog(`c9:`)
    bestMove.x = willSetupACapture[0].x
    bestMove.y = willSetupACapture[0].y
    ShowBestMove(willSetupACapture[0])

  } else {
    myLog(`c10:`)
    bestMove.x = bestMoveByScore[0].x
    bestMove.y = bestMoveByScore[0].y
    ShowBestMove(bestMoveByScore[0])
  }

  PutStone(bestMove.x, bestMove.y, true)


}
function ShowBestMove(move) {
  // fix on clickAttribute
  $(`#cross${move.x}r${move.y}c .circle-green`).show()
}
function ShowValidSpots() {
  const turn = GAME.Turn == "Black" ? 1 : 2
  // fix on clickAttribute
  for (i = 0; i < GAME.Size; i++) {
    for (j = 0; j < GAME.Size; j++) {
      $(`#cross${i}r${j}c`).attr("onClick", `PutStone(${i},${j}, true)`);
    }
  }
  // show valid/invalid moves
  let cells = FindValidSpots(MATRIX, turn, GAME.Mode).filter(c => !c.valid)
  $(`.score`).text("")
  for (i = 0; i < cells.length; i++) {
    const x = cells[i].x
    const y = cells[i].y
    $(`#cross${x}r${y}c .fa-times`).show();
  }
}
// 5 4 1
// 1 5 -4
// 3 1 2
function update() {

  $("#board img").hide();
  $("#board i").hide();
  $(`#board .score`).hide()
  $(`.score`).removeClass("red")
  $(`.score`).removeClass("green")

  for (i = 0; i < GAME.Size; i++) {
    for (j = 0; j < GAME.Size; j++) {
      if (MATRIX[i][j]) {
        $(`#cross${i}r${j}c`).removeClass("flag");

        if (MATRIX[i][j] == 2) {
          $(`#cross${i}r${j}c .circle-white`).show();
        } else if (MATRIX[i][j] == 1) {
          $(`#cross${i}r${j}c .circle-black`).show();
        }


      }
    }
  }
  ShowMovesHistory()
  RenderInfos()
  // myLog("diagTopRight: ", ScrapDirection(MATRIX, 2, -1, 9,9, "diagTopRight"))
}

function ShowMovesHistory() {
  const chunkSize = 2;
  let movesTxtArea = ''
  for (let i = 0; i < MOVES.history.length; i += chunkSize) {
    const chunk = MOVES.history.slice(i, i + chunkSize);
    // do whatever
    movesTxtArea += chunk.join("-") + '\n'
  }
  $("#moves_history").text(movesTxtArea)

}
function result(R, C, player) {
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

