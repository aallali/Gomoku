
function ShowMovesHistory() {
    // const mvs = MOVES.history
    // const chunkSize = 5;
    // let movesTxtArea = ''
    // for (let i = 0; i < mvs.length; i += chunkSize) {
    //     const chunk = mvs.slice(i, i + chunkSize);
    //     // do whatever
    //     movesTxtArea += chunk.join(" ") + '\n'
    // }
    $("#moves_bar").val(MOVES.history.join(", "))
}

function ShowBestMove(move) {
    // fix on clickAttribute
    $(`#cross${move.x}r${move.y}c .circle-green`).show()
}
function ShowValidSpots() {
    const turn = GAME.Turn == "Black" ? 1 : 2
    let cells = FindValidSpots(MATRIX, turn, GAME.Mode)
    // fix on clickAttribute
    for (i = 0; i < GAME.Size; i++) {
        for (j = 0; j < GAME.Size; j++) {
            $(`#cross${i}r${j}c`).attr("onClick", `PutStone(${i},${j}, true)`);
        }
    }
    // show valid/invalid moves
    const invalidCells = cells.filter(c => !c.valid)
    $(`.score`).text("")

    for (i = 0; i < invalidCells.length; i++) {
        const x = invalidCells[i].x
        const y = invalidCells[i].y
        $(`#cross${x}r${y}c .fa-times`).show();
    }
    return cells.filter(c => c.valid).length
}
/**
 * 
 */
function RenderInfos() {
    $("#infos_turn").text(GAME.Turn)

    $("#infos_black_captures").text(GAME.Black.captures)
    $("#infos_black_score").text(GAME.Black.score)

    $("#infos_white_captures").text(GAME.White.captures)
    $("#infos_white_score").text(GAME.White.score)

    $("#infos_winner").text(!GAME.Winner ? 'Still Playing...' : GAME.Winner)
}

/**
 * 
 */
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
                    $("#board").append(`<div class ='cross flagPro'>
          <img src='assets/images/golden-stone.png' class='golden-stone' ></img>  
                    </div>`);
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
          onmouseover='ShowCellsInfo(${i - 1},${j - 1})'
          onmouseout='UnShowCellsInfo()'>
          <b class="score"></b>
          <i class = 'fa fa-times' style="display:none;"></i>

          <img src='assets/images/golden-stone.png' class='golden-stone' style="display:none;"></img>
          <img src='assets/images/wood-stone.webp' class='welcome-stone' style="display:none;"></img>
          <img src='assets/images/white-stone.webp' class='circle-white' style="display:none;"></img>
          <img src='assets/images/check.png' class='circle-green' style="display:none;"></img>
          <img src='assets/images/black-stone2.png' class='circle-black' style="display:none;"></img>
          <img src='assets/images/green-circle.webp' class='circle-wood' style="display:none;"></img>
  
          </div>`
                );
            }
        }
        $("#board").append("<br>");

       
    }
    // $("#board").append(`<input type="text" id='moves_bar'>`);

}
/**
 * 
 * @param {*} i 
 * @param {*} j 
 */
function ShowCellsInfo(i, j) {
    $("#cell_coord").text(`${alpha[i] + j} (${i},${j})`)
}
function UnShowCellsInfo() {
    $("#cell_coord").text(`XY ... (X,Y)`)
}
/**
 * 
 */
async function UpdateBoard() {
    if (GAME.Ended && !GAME.Winner) {
      await blok(1)
    }
    $("#board div[id*=cross] img").hide();
    $("#board i").hide();
    $(`#board .score`).hide()
    $(`.score`).removeClass("red")
    $(`.score`).removeClass("green")
  
    for (i = 0; i < GAME.Size; i++) {
      for (j = 0; j < GAME.Size; j++) {
        if (MATRIX[i][j]) {
          $(`#cross${i}r${j}c`).removeClass("flag");
          $(`#cross${i}r${j}c`).removeClass("flagPro");
          if (GAME.Ended && !GAME.Winner) {
            $(`#cross${i}r${j}c`).addClass("flagPro");
            if (i < 5 || i > 13) {
              $(`#cross${i}r${j}c .golden-stone`).show();
            } else if (i == 8 && j == 2 || i == 12 && j == 16) {
              $(`#cross${i}r${j}c .circle-black`).show();
            } else {
              $(`#cross${i}r${j}c .welcome-stone`).show();
            }
            await blok(0.1)
          } else {
            if (MATRIX[i][j] == 2) {
              $(`#cross${i}r${j}c .circle-white`).show();
            } else if (MATRIX[i][j] == 1) {
              $(`#cross${i}r${j}c .circle-black`).show();
            }
          }
        }
      }
    }
  
    // myLog("diagTopRight: ", ScrapDirection(MATRIX, 2, -1, 9,9, "diagTopRight"))
  }