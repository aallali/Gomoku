import { findCaptures, getPossibleMoves, isForbiddenMove } from "./util";

const { log } = console;
let aiMoveCheck = 10,
  size = 19,
  influenceAlright = false,
  anti = false;
function gomokuShapeScore(
  consecutive: number,
  openEnds: number,
  currTurn: boolean
) {
  switch (consecutive) {
    case 4:
      switch (openEnds) {
        case 0:
          return 0;
        case 1:
          if (currTurn) return 100000000;
          return 50;
        case 2:
          if (currTurn) return 100000000;
          return 500000;
      }
      break;
    case 3:
      switch (openEnds) {
        case 0:
          return 0;
        case 1:
          if (currTurn) return 7;
          return 5;
        case 2:
          if (currTurn) return 10000;
          return 50;
      }
      break;
    case 2:
      switch (openEnds) {
        case 0:
          return 0;
        case 1:
          return 2;
        case 2:
          return 5;
      }
      break;
    case 1:
      switch (openEnds) {
        case 0:
          return 0;
        case 1:
          return 0.5;
        case 2:
          return 1;
      }
      break;
    default:
      return 200000000;
  }
  return 0;
}

function analyzeGomokuColor(
  board: string[][],
  black: boolean,
  bturn: boolean,
  startx: number,
  endx: number,
  starty: number,
  endy: number
) {
  let score = 0;
  let color = black ? "b" : "w";
  let countConsecutive: number = 0;
  let openEnds = 0;

  for (let i = startx; i < endx; i++) {
    for (let a = starty; a < endy; a++) {
      if (board[i][a] === color) countConsecutive++;
      else if (board[i][a] === null && countConsecutive > 0) {
        openEnds++;
        score += gomokuShapeScore(countConsecutive, openEnds, bturn === black);
        countConsecutive = 0;
        openEnds = 1;
      } else if (board[i][a] === null) openEnds = 1;
      else if (countConsecutive > 0) {
        score += gomokuShapeScore(countConsecutive, openEnds, bturn === black);
        countConsecutive = 0;
        openEnds = 0;
      } else openEnds = 0;
    }
    if (countConsecutive > 0)
      score += gomokuShapeScore(countConsecutive, openEnds, bturn === black);
    countConsecutive = 0;
    openEnds = 0;
  }

  for (let a = starty; a < endy; a++) {
    for (let i = startx; i < endx; i++) {
      if (board[i][a] === color) countConsecutive++;
      else if (board[i][a] === null && countConsecutive > 0) {
        openEnds++;
        score += gomokuShapeScore(countConsecutive, openEnds, bturn === black);
        countConsecutive = 0;
        openEnds = 1;
      } else if (board[i][a] === null) openEnds = 1;
      else if (countConsecutive > 0) {
        score += gomokuShapeScore(countConsecutive, openEnds, bturn === black);
        countConsecutive = 0;
        openEnds = 0;
      } else openEnds = 0;
    }
    if (countConsecutive > 0)
      score += gomokuShapeScore(countConsecutive, openEnds, bturn === black);
    countConsecutive = 0;
    openEnds = 0;
  }

  for (let x = startx; x < endx; x++) {
    // diagonal 1
    for (let i = x, a = starty; i < endx && a < endy; i++, a++) {
      if (board[i][a] === color) countConsecutive++;
      else if (board[i][a] === null && countConsecutive > 0) {
        openEnds++;
        score += gomokuShapeScore(countConsecutive, openEnds, bturn === black);
        countConsecutive = 0;
        openEnds = 1;
      } else if (board[i][a] === null) openEnds = 1;
      else if (countConsecutive > 0) {
        score += gomokuShapeScore(countConsecutive, openEnds, bturn === black);
        countConsecutive = 0;
        openEnds = 0;
      } else openEnds = 0;
    }
    if (countConsecutive > 0)
      score += gomokuShapeScore(countConsecutive, openEnds, bturn === black);
    countConsecutive = 0;
    openEnds = 0;
  }

  for (let y = starty + 1; y < endy; y++) {
    // diagonal 1
    for (let i = startx, a = y; i < endx && a < endy; i++, a++) {
      if (board[i][a] === color) countConsecutive++;
      else if (board[i][a] === null && countConsecutive > 0) {
        openEnds++;
        score += gomokuShapeScore(countConsecutive, openEnds, bturn === black);
        countConsecutive = 0;
        openEnds = 1;
      } else if (board[i][a] === null) openEnds = 1;
      else if (countConsecutive > 0) {
        score += gomokuShapeScore(countConsecutive, openEnds, bturn === black);
        countConsecutive = 0;
        openEnds = 0;
      } else openEnds = 0;
    }
    if (countConsecutive > 0)
      score += gomokuShapeScore(countConsecutive, openEnds, bturn === black);
    countConsecutive = 0;
    openEnds = 0;
  }

  for (let x = startx; x < endx; x++) {
    // diagonal 2
    for (let i = x, a = starty; i >= startx && a < endy; i--, a++) {
      if (board[i][a] === color) countConsecutive++;
      else if (board[i][a] === null && countConsecutive > 0) {
        openEnds++;
        score += gomokuShapeScore(countConsecutive, openEnds, bturn === black);
        countConsecutive = 0;
        openEnds = 1;
      } else if (board[i][a] === null) openEnds = 1;
      else if (countConsecutive > 0) {
        score += gomokuShapeScore(countConsecutive, openEnds, bturn === black);
        countConsecutive = 0;
        openEnds = 0;
      } else openEnds = 0;
    }
    if (countConsecutive > 0)
      score += gomokuShapeScore(countConsecutive, openEnds, bturn === black);
    countConsecutive = 0;
    openEnds = 0;
  }

  for (let y = starty + 1; y < endy; y++) {
    // diagonal 2
    for (let i = endx - 1, a = y; i >= startx && a < endy; i--, a++) {
      if (board[i][a] === color) countConsecutive++;
      else if (board[i][a] === null && countConsecutive > 0) {
        openEnds++;
        score += gomokuShapeScore(countConsecutive, openEnds, bturn === black);
        countConsecutive = 0;
        openEnds = 1;
      } else if (board[i][a] === null) openEnds = 1;
      else if (countConsecutive > 0) {
        score += gomokuShapeScore(countConsecutive, openEnds, bturn === black);
        countConsecutive = 0;
        openEnds = 0;
      } else openEnds = 0;
    }
    if (countConsecutive > 0)
      score += gomokuShapeScore(countConsecutive, openEnds, bturn === black);
    countConsecutive = 0;
    openEnds = 0;
  }

  return score;
}
export function analyzeGomoku(board: string[][], bturn: boolean) {
  return (
    analyzeGomokuColor(board, true, bturn, 0, 19, 0, 19) -
    analyzeGomokuColor(board, false, bturn, 0, 19, 0, 19)
  );
}
function analyzePieceWeightGomoku(
  board: any,
  bturn: boolean,
  x: number,
  y: number
) {
  board[x][y] = bturn ? "b" : "w";
  board = findCaptures(board, x, y)[0];
  let startx = x > 4 ? x - 4 : 0,
    starty = y > 4 ? y - 4 : 0;
  let endx = x < board.length - 5 ? x + 5 : board.length,
    endy = y < board[x].length - 5 ? y + 5 : board[x].length;
  let analysis = analyzeGomokuColor(
    board,
    bturn,
    !bturn,
    startx,
    endx,
    starty,
    endy
  );
  board[x][y] = null;
  return (
    analysis -
    analyzeGomokuColor(board, bturn, !bturn, startx, endx, starty, endy)
  );
}
function checkGomokuWin(board: any, x: number, y: number) {
  let countConsecutive = 0;
  let color = null;
  for (
    let i = x - 4;
    i <= x + 4;
    i++ // Horizontal
  )
    if (i >= 0 && i < board.length && countConsecutive < 5)
      if (board[i][y] === color) countConsecutive++;
      else if (board[i][y] === "b" || board[i][y] === "w") {
        color = board[i][y];
        countConsecutive = 1;
      } else color = null;
    else if (countConsecutive === 5) return true;
  if (countConsecutive === 5) return true;

  countConsecutive = 0;
  color = null;

  for (
    let a = y - 4;
    a <= y + 4;
    a++ // Vertical
  )
    if (a >= 0 && a < board.length && countConsecutive < 5)
      if (board[x][a] === color) countConsecutive++;
      else if (board[x][a] === "b" || board[x][a] === "w") {
        color = board[x][a];
        countConsecutive = 1;
      } else color = null;
    else if (countConsecutive === 5) return true;
  if (countConsecutive === 5) return true;

  countConsecutive = 0;
  color = null;

  for (
    let i = x - 4, a = y - 4;
    i <= x + 4;
    i++, a++ // diagonal 1 topleft - bottomright
  )
    if (
      a >= 0 &&
      a < board.length &&
      i >= 0 &&
      i < board[a].length &&
      countConsecutive < 5
    )
      if (board[i][a] === color) countConsecutive++;
      else if (board[i][a] === "b" || board[i][a] === "w") {
        color = board[i][a];
        countConsecutive = 1;
      } else color = null;
    else if (countConsecutive === 5) return true;
  if (countConsecutive === 5) return true;

  countConsecutive = 0;
  color = null;

  for (
    let i = x - 4, a = y + 4;
    i <= x + 4;
    i++, a-- // diagonal 1 topright - bottomleft
  )
    if (
      a >= 0 &&
      a < board.length &&
      i >= 0 &&
      i < board[a].length &&
      countConsecutive < 5
    )
      if (board[i][a] === color) countConsecutive++;
      else if (board[i][a] === "b" || board[i][a] === "w") {
        color = board[i][a];
        countConsecutive = 1;
      } else color = null;
    else if (countConsecutive === 5) return true;
  if (countConsecutive === 5) return true;
}
function adjacent(board: string[][], iTemp: number, aTemp: number) {
  if (iTemp === (size - 1) / 2 && aTemp === iTemp) return true;

  let d = influenceAlright ? 2 : 1;

  for (let i = iTemp - d; i <= iTemp + d; i++)
    for (let a = aTemp - d; a <= aTemp + d; a++)
      if (i >= 0 && a >= 0 && i < board.length && a < board[i].length)
        if (board[i][a] !== null) return true;

  return false;
}

function winningMove(board: (string | null)[][], bturn: boolean) {
  let color = bturn ? "b" : "w";
  let moves = getPossibleMoves(board as any, color);
  for (let i = 0; i < moves.length; i++) {
    const x = moves[i].x;
    const y = moves[i].y;
    if (adjacent(board as any, y, x)) {
      board[y][x] = color;
      if (checkGomokuWin(board, y, x)) {
        board[y][x] = null;
        return [y, x];
      }
      board[y][x] = null;
    }
  }

  return false;
}

function sortMoves(board: any[][], bturn: boolean) {
  // board.forEach((row: any) => {
  //     console.log(row.map((l: any) => (l === null ? "." : l)).join(" "));
  //   });
  let color = bturn ? "b" : "w";
  let analysis, analysis2;
  let sortedMoves: string | any[] = [];

  // if (!anti) {
  let win = winningMove(board, bturn);
  log("win: > ", win)
  if (win) {
    board[win[0]][win[1]] = color;
    analysis = analyzeGomoku(board, !bturn);
    board[win[0]][win[1]] = null;
    return [[analysis, win[0], win[1]]];
  } else win = winningMove(board, !bturn);
  if (win) {
    board[win[0]][win[1]] = color;
    analysis = analyzeGomoku(board, !bturn);
    board[win[0]][win[1]] = null;
    return [[analysis, win[0], win[1]]];
  }
  // }
  log("start checkign moves")
  let moves = getPossibleMoves(board, color);
  for (let i = 0; i < moves.length; i++) {
    const x = moves[i].x;
    const y = moves[i].y;
    if (adjacent(board, y, x)) {
      analysis = analyzePieceWeightGomoku(board, bturn, y, x);
      analysis2 = analyzePieceWeightGomoku(board, !bturn, y, x);
      insert([analysis < analysis2 ? analysis : analysis2, y, x], sortedMoves);
    }
  }
  log("end checkign moves")


  return sortedMoves;
}
function locationOf(element: any, array: any, start?: any, end?: any): any {
  start = start || 0;
  end = end || array.length;
  let pivot = parseInt(start + (end - start) / 2, 10);
  if (end - start <= 1 || array[pivot][0] === element) return pivot;
  if (array[pivot][0] < element) {
    return locationOf(element, array, pivot, end);
  } else {
    return locationOf(element, array, start, pivot);
  }
}
function insert(element: any, array: any[]) {
  array.splice(locationOf(element[0], array) + 1, 0, element);
  return array;
}
export function bestGomokuMove(board: any, bturn: boolean, depth: number) {
  let color = bturn ? "b" : "w";
  let xBest = -1,
    yBest = -1;
  let bestScore = bturn ? -1000000000 : 1000000000;
  let analysis;
  let blackResponse;
  let analTurn = depth % 2 === 0 ? bturn : !bturn;
  let sortedMoves;

  //	 if (depth=== 1)
  //		 sortedMoves = possibleMoves(bturn);

  sortedMoves = sortMoves(board, bturn);
  log(sortedMoves.length, sortedMoves.length);
  for (
    let iTemp = sortedMoves.length - 1;
    iTemp > sortedMoves.length - aiMoveCheck - 1 && iTemp >= 0;
    iTemp--
  ) {
    let tempi = anti ? sortedMoves.length - 1 - iTemp : iTemp;
    const y = sortedMoves[tempi][1];
    const x = sortedMoves[tempi][2];
    board[y][x] = color;
    board = findCaptures(board, y, x)[0];
    if (depth === 1) {
      analysis = analyzeGomoku(board, analTurn);
      if (anti) analysis *= -1;
    } else {
      blackResponse = bestGomokuMove(board, !bturn, depth - 1);
      analysis = blackResponse[2];
    }
    board[y][x] = null;
    if ((analysis > bestScore && bturn) || (analysis < bestScore && !bturn)) {
      bestScore = analysis;
      xBest = x;
      yBest = y;
    }
  }

  return [yBest, xBest, bestScore];
}
