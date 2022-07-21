import minimax from "./miniMax";

let { log } = console;
let paths = {
  doubleFreeThree: [
    ["-1", "", "", "", "", "", "", ""],
    ["", "1", "", "", "", "", "", ""],
    ["", "", "1", "", "", "", "", ""],
    ["", "", "", "0", "", "", "", ""],
    ["", "", "", "0", "1", "1", "1", "-1"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
  ],
};
// const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
// const paths: Record<string, string> = {
//   right: "diagTL:diagBL",
//   left: "diagTR:diagBR",
//   top: "diagBR:diagBL",
//   bottom: "diagTR:diagTL",
//   diagTR: "left:bottom",
//   diagTL: "right:bottom",
//   diagBL: "top:right",
//   diagBR: "top:left",
// };
const directions: Record<string, number[]> = {
  top: [0, -1],
  bottom: [0, 1],

  right: [1, 0],
  left: [-1, 0],

  diagTR: [1, -1],
  diagTL: [-1, -1],

  diagBR: [1, 1],
  diagBL: [-1, 1],
};
const mirror: Record<string, string> = {
  top: "bottom",
  bottom: "top",

  right: "left",
  left: "right",

  diagTR: "diagBL",
  diagBL: "diagTR",

  diagTL: "diagBR",
  diagBR: "diagTL",
};
function countTotal(
  board: string[][],
  curY: number,
  curX: number,
  dirXY: number[]
) {
  // what color is the pawn to check now
  const now = board[curY][curX];
  let tempX = curX;
  let tempY = curY;
  let total = 0;
  while (true) {
    tempX += dirXY[0]; // Check for the next pawn
    tempY += dirXY[1];

    // If the new piece is equal to what I want to check now (meaning consecutive)
    if (board[tempY] && board[tempY][tempX] === now)
      // number of consecutive pieces + 1
      total++;
    else break;
  }

  return total;
}

export function findWinner(board: string[][], y: number, x: number) {
  const connections = {
    diagR:
      countTotal(board, y, x, directions["diagTR"]) +
      countTotal(board, y, x, directions["diagBL"]),
    diagL:
      countTotal(board, y, x, directions["diagBR"]) +
      countTotal(board, y, x, directions["diagTL"]),
    vertical:
      countTotal(board, y, x, directions["bottom"]) +
      countTotal(board, y, x, directions["top"]),
    horizontal:
      countTotal(board, y, x, directions["right"]) +
      countTotal(board, y, x, directions["left"]),
  };
  if (board.every((row: string[]) => row.every((col: string) => col))) {
    console.log("DRAAW");
    return "d";
  }
  if (
    connections["horizontal"] > 3 ||
    connections["vertical"] > 3 ||
    connections["diagL"] > 3 ||
    connections["diagR"] > 3
  )
    return board[y][x];

  // Check if there is no place left on the boar === DRAW === TIE

  return;
}
/**
 * find the captures in the board after the play
 * @param board
 * @param y
 * @param x
 * @returns [capturesExists, board]
 */
export function findCaptures(board: string[][], y: number, x: number) {
  const now: string = board[y][x];
  const enemy: string = now === "b" ? "w" : "b";
  const dirs: string[] = Object.keys(directions);
  let foundCapture = false;
  let copyBoard;
  for (let i = 0; i < dirs.length; i++) {
    copyBoard = JSON.parse(JSON.stringify(board));
    let k = 2;
    let tmpY = y;
    let tmpX = x;
    // create deep copy for the board
    const dir: string = dirs[i];

    while (k) {
      tmpY += directions[dir][1];
      tmpX += directions[dir][0];

      if (
        tmpY >= 0 &&
        tmpX >= 0 &&
        tmpY < 19 &&
        tmpX < 19 &&
        copyBoard[tmpY][tmpX] === enemy
      ) {
        copyBoard[tmpY][tmpX] = null;
        k--;
        continue;
      }
      break;
    }

    if (!k) {
      tmpY += directions[dir][1];
      tmpX += directions[dir][0];

      if (
        tmpY >= 0 &&
        tmpX >= 0 &&
        tmpY < 19 &&
        tmpX < 19 &&
        copyBoard[tmpY][tmpX] === now
      )
        board = copyBoard;
      foundCapture = true;
    }
  }

  return [JSON.parse(JSON.stringify(board)), foundCapture];
}

export function isForbiddenMove(
  board: string[][],
  y: number,
  x: number,
  curr: string
) {
  const now: string = curr;
  const enemy: string = now === "b" ? "w" : "b";
  const forbiddenCombination = `${enemy}${now}${enemy}`;

  const dirs = Object.keys(mirror);
  // i have to check the capture move in vertic and horizontal and diagonal (left and right)
  for (let i = 0; i < dirs.length; i++) {
    let tmpY = y;
    let tmpX = x;
    const copyBoard = JSON.parse(JSON.stringify(board)); // create deep copy for the board
    const dir: string = dirs[i];
    let combin = "";

    tmpY += directions[dir][1];
    tmpX += directions[dir][0];

    if (tmpY >= 0 && tmpX >= 0 && tmpY < 19 && tmpX < 19) {
      combin += copyBoard[tmpY][tmpX];
    }

    tmpY = y;
    tmpX = x;

    tmpY -= directions[dir][1];
    tmpX -= directions[dir][0];

    if (tmpY >= 0 && tmpX >= 0 && tmpY < 19 && tmpX < 19)
      combin += copyBoard[tmpY][tmpX];

    tmpY -= directions[dir][1];
    tmpX -= directions[dir][0];

    if (tmpY >= 0 && tmpX >= 0 && tmpY < 19 && tmpX < 19)
      combin += copyBoard[tmpY][tmpX];

    if (combin === forbiddenCombination) return true;
  }

  return false;
}
const matrixRotator: any = (matrix: string[][], turns: number | undefined) => {
  // Make the rows to become cols (transpose)
  const mtrx = matrix.map((_, i) => matrix.map((column) => column[i]));
  // Reverse each row to get a rotated matrix
  const res = mtrx.map((row) => row.reverse());
  if (turns && turns > 0) return matrixRotator(res, --turns);
  return res;
};
export function isDoubleFreeThree(
  board: string[][],
  y: number,
  x: number,
  curr: string
) {
  const doubleFreeThreePattern = paths["doubleFreeThree"];
  let copyBoard = JSON.parse(JSON.stringify(board)); // create deep copy for the board
  copyBoard[y][x] = curr;
  copyBoard = trim(copyBoard, "", true);

  const enemy = curr === "b" ? "w" : curr;
  let allRotates: any = new Set();
  for (let i = 0; i < 8; i++) {
    let rotated = matrixRotator(doubleFreeThreePattern, i);
    let reversed = matrixRotator(
      doubleFreeThreePattern.map((l: any) => l.reverse()),
      i
    );

    allRotates.add(rotated);
    allRotates.add(reversed);
  }
  allRotates = [...allRotates];

  for (let i = 0; i < allRotates.length; i++)
    if (
      findDoublePattern(copyBoard, curr, enemy, trim(allRotates[i], "", false))
    )
      return true;
  return false;
}

export function findDoublePattern(
  cboard: string[][],
  curr: string,
  enemy: string,
  doubleFreeThreePattern: string[][]
) {
  let k = 0;

  let board: string[][] = JSON.parse(JSON.stringify(cboard));

  // let row2Add = board.length < doubleFreeThreePattern.length ? doubleFreeThreePattern.length - board.length : 0
  let cols2Add =
    board[0].length < doubleFreeThreePattern[0].length
      ? doubleFreeThreePattern[0].length - board[0].length
      : 0;

  board = board.map((r: string[]) => [...r, ...Array(cols2Add).fill("")]);

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      k = 0;
      for (let y = 0; y < doubleFreeThreePattern.length; y++) {
        for (let x = 0; x < doubleFreeThreePattern[y].length; x++) {
          // log(`i:${i},j:${j},y:${y},x:${x},`)
          if (x + j < board[0].length && y + i < board.length) {
            if (
              (doubleFreeThreePattern[y][x] === "1" &&
                board[y + i][x + j] === curr) ||
              (doubleFreeThreePattern[y][x] === "0" &&
                board[y + i][x + j] === "") ||
              (doubleFreeThreePattern[y][x] === "-1" &&
                board[y + i][x + j] !== enemy)
            )
              k++;
          }
        }
      }
      if (k === 9) return true;
    }
  }

  return false;
}

const patterns: Record<string, string[]> = {
  fiveInRow: ["11111"],
  openFourDouble: ["011110"],
  openFour: ["11110", "11101", "11011", "10111", "01111"],
  openFourBroken: ["011112", "211110"],
  openThree: ["01110", "01011", "10101"],
  openThreeBroken: ["01112", "010112"],
  capture: ["1220", "0221"],

  openThreeBrokenCovered: ["2011102"],
  openTwo: ["01010", "01100"],
  openTwoBroken: ["01120", "01012"],

  twoCoverTwo: ["010010"],
  twoCoverTwoBroken: ["10012"],
  twoCoverThree: ["10001"],

  close: ["10", "01"],
};

const scores: Record<string, number> = {
  fiveInRow: 500,
  openFourDouble: 400,
  openFour: 90,
  openFourBroken: 85,
  openThree: 80,
  openThreeBroken: 75,
  capture: 70,
  openThreeBrokenCovered: 40,
  openTwo: 30,
  openTwoBroken: 25,
  twoCoverTwo: 20,
  twoCoverTwoBroken: 15,
  twoCoverThree: 10,
  close: 5,
};

export function get5PiecesDoubleDirection(
  board: string[][],
  y: number,
  x: number,
  direction: { x: number; y: number },
  player: string
) {
  let res = [];
  let [tmpY, tmpX] = [y, x];

  for (let i = 0; i < 5; i++) {
    tmpY -= direction.y;
    tmpX -= direction.x;
    res.push(board[tmpY]?.[tmpX]);
  }
  res.reverse();
  res.push(board[y]?.[x]);
  // reset temp coordination
  [tmpY, tmpX] = [y, x];
  for (let i = 0; i < 5; i++) {
    tmpY += direction.y;
    tmpX += direction.x;
    res.push(board[tmpY]?.[tmpX]);
  }
  res = res.map((l) => {
    if (l === undefined) return "";
    if (l === null) return 0;
    if (l === player) return 1;
    return 2;
  });
  return res.join("");
}
export function getPossibleMoves(board: string[][], player: string) {
  let moves = getAvailableSpots(board)
    .filter((l: string) => {
      let y = parseInt(l.split(",")[0]);
      let x = parseInt(l.split(",")[1]);

      const isInCaptureMove = isForbiddenMove(board, y, x, player);
      const isDouble = isDoubleFreeThree(board, y, x, player);
      // log(isInCaptureMove, isDouble)

      return !isInCaptureMove && !isDouble;
    })
    .map((l: string) => ({
      y: parseInt(l.split(",")[0]),
      x: parseInt(l.split(",")[1]),
    }));

  return moves as { x: number; y: number }[];
}
export function heuristic(board: string[][], player: string) {
  let score = 0;
   
  const dirs: string[] = Object.keys(directions);
  const patternKys: string[] = Object.keys(patterns);
  for (let i = 0; i < 19; i++) {
    const j = 0;
    let row = board[i]
      .map((l) => {
        if (l === null) return 0;
        if (l === player) return 1;
        return 2;
      })
      .join("");
 
    // eslint-disable-next-line no-loop-func
    patternKys.forEach((key: string) => {
      patterns[key].forEach((path) => {
        if (row.includes(path)) {
          // log(key, row, "--", path, row.includes(path))

          score += scores[key];
        }
      });
    });
  }
  for (let j = 0;j < 19;j++) {
    const i = 0;
    let row = board[i]
      .map((l) => {
        if (l === null) return 0;
        if (l === player) return 1;
        return 2;
      })
      .join("");
  
    // eslint-disable-next-line no-loop-func
    patternKys.forEach((key: string) => {
      patterns[key].forEach((path) => {
        if (row.includes(path)) {
          // log(key, row, "--", path, row.includes(path))

          score += scores[key];
        }
      });
    });
  }
  getDiagos(board, player).forEach((el) => {
 
    patternKys.forEach((key: string) => {
      patterns[key].forEach((path) => {
        if (el.row.includes(path)) {
          // log(key, el.row, "++", path, el.row.includes(path));

          score += scores[key];
        }
      });
    });
  });

  return score;
}

function getDiagos(board: any, player: string) {
  let rows = [];

  for (let y = 0; y < 19; y++) {
    let row = [];
    let x = 0;

    let [tmpX, tmpY] = [x, y];

    while (tmpX < 19 && tmpY < 19) {
      row.push(board[tmpY][tmpX]);
      tmpX++;
      tmpY++;
    }

    rows.push({
      x,
      y,
      row: row
        .map((l) => {
          if (l === null) return 0;
          if (l === player) return 1;

          return 2;
        })
        .join(""),
    });
  }
  for (let x = 0; x < 19; x++) {
    let row = [];
    let y = 0;

    let [tmpX, tmpY] = [x, y];
    if (!rows.filter((l) => l.x == tmpX && l.y === tmpY).length) {
      while (tmpX < 19 && tmpY < 19) {
        row.push(board[tmpY][tmpX]);
        tmpX++;
        tmpY++;
      }

      rows.push({
        x,
        y,
        row: row
          .map((l) => {
            if (l === null) return 0;
            if (l === player) return 1;

            return 2;
          })
          .join(""),
      });
    }
  }
  rows = [];
  for (let y = 18; y >= 0; y--) {
    let row = [];
    let x = 18;

    let [tmpX, tmpY] = [x, y];

    while (tmpX >= 0 && tmpY < 18) {
      row.push(board[tmpY][tmpX]);
      tmpX--;
      tmpY++;
    }

    rows.push({
      x,
      y,
      row: row
        .map((l) => {
          if (l === null) return 0;
          if (l === player) return 1;

          return 2;
        })
        .join(""),
    });
  }
  for (let x = 18; x >= 0; x--) {
    let row = [];
    let y = 0;

    let [tmpX, tmpY] = [x, y];
    if (!rows.filter((l) => l.x === tmpX && l.y === tmpY).length) {
      while (tmpX  >= 0 && tmpY  < 19) {
        row.push(board[tmpY][tmpX]);
        tmpX--;
        tmpY++;
      }
     
      rows.push({
        x,
        y,
        row: row
          .map((l) => {
            if (l === null) return 0;
            if (l === player) return 1;

            return 2;
          })
          .join(""),
      });
    }
  }
 
  return rows
    .map((l) => ({
      ...l,
      row: l.row.replace(/^[0]+(?=0)/, "").replace(/(?<=0)[0]+$/, ""),
    }))
    .filter((l) => l.row !== "0");
}

function bestGomokuMove(board: string[][], player: string, depth: number) {
  var color = player;
  const bturn = player === "b";
  var xBest = -1,
    yBest = -1;
  var bestScore = bturn ? -1000000000 : 1000000000;
  var analysis, response;

  var moves = getPossibleMoves(board, player);

  for (var i = 0; i < moves.length; i++) {
    const fakeBoard = JSON.parse(JSON.stringify(board));
    fakeBoard[moves[i].y][moves[i].x] = color;
    if (depth === 1) {
      analysis = heuristic(fakeBoard, player);
    } else {
      response = bestGomokuMove(fakeBoard, player, depth - 1);
      analysis = response[2];
    }

    if ((analysis > bestScore && bturn) || (analysis < bestScore && !bturn)) {
      bestScore = analysis;
      xBest = moves[i].x;
      yBest = moves[i].y;
    }
  }

  return [xBest, yBest, bestScore];
}
export function bestMoveInState(board: string[][], player: string) {
  // log("start");
  // const bmove = bestGomokuMove(board, player, 2);
  // log(bmove);
  // if (bmove[0] === -1)
  // return { x: 9, y: 9 };
  // return { x: bmove[0], y: bmove[1] };
  // log("end");
  const moves = getPossibleMoves(board, player);
  let move: { x: number; y: number } = { x: 9, y: 9 };
  let bestScore = 0;
  let movesSorted = [];
  for (let i = 0; i < moves.length; i++) {
    let fakeBoard = JSON.parse(JSON.stringify(board));
    fakeBoard[moves[i].y][moves[i].x] = player;
    fakeBoard = findCaptures(board, moves[i].y, moves[i].x);

    // log(fakeBoard)
    fakeBoard = fakeBoard[0];
    // const score = minimax(
    //   fakeBoard,
    //   player === "b" ? "w" : "b",
    //   2,
    //   false,
    //   -1000,
    //   1000
    // );
    log("----------");
    log(moves[i]);
    const score = heuristic(fakeBoard, player);

    movesSorted.push({ x: moves[i].x, y: moves[i].y, score });

    if (score > bestScore) {
      bestScore = score;
      move = moves[i];
    }
  }

  movesSorted.sort((a, b) => b.score - a.score);
  return movesSorted;
}
/**
 * crop a board by given coordinations
 * @param board
 * @param ymin
 * @param ymax
 * @param xmin
 * @param xmax
 * @param margin
 * @returns
 */
function crop(
  board: string[][],
  ymin: number,
  ymax: number,
  xmin: number,
  xmax: number,
  margin: boolean
) {
  if (margin) {
    ymin = ymin > 0 ? --ymin : ymin;
    ymax = ymax < 18 ? ymax + 2 : ymax;
    xmin = xmin > 0 ? --xmin : xmin;
    xmax = xmax < 18 ? xmax + 2 : xmax;
  } else {
    ymin = ymin > 0 ? --ymin : ymin;
    ymax = ymax < 18 ? ++ymax : ymax;
    xmax = xmax < 18 ? xmax + 1 : xmax;
  }
  return board.slice(ymin, ymax).map(function (row) {
    return row.slice(xmin, xmax);
  });
}

/**
 * trim board from all empty blocks to minize area of search
 * @param board
 * @param toTrim
 * @param margin
 * @returns
 */
function trim(board: string[][], toTrim: string, margin: boolean) {
  let cmin, rmin, cmax, rmax;

  cmin = board[0].length;
  rmin = board.length;
  cmax = -1;
  rmax = -1;

  for (let r = 0; r < board.length; r++)
    for (let c = 0; c < board[0].length; c++)
      if (board[r][c] !== toTrim) {
        if (cmin > c) cmin = c;
        if (cmax < c) cmax = c;
        if (rmin > r) rmin = r;
        if (rmax < r) rmax = r;
      }
  return crop(board, rmin, rmax, cmin, cmax, margin);
}

function findNearbySpots(board: string[][], y: number, x: number) {
  let spots = [];

  for (let k in directions) {
    let checkSpot = board[y + directions[k][1]]?.[x + directions[k][0]];
    if (checkSpot === null)
      spots.push(`${y + directions[k][1]},${x + directions[k][0]}`);
  }
  return spots;
}

export function getAvailableSpots(board: string[][]) {
  const spots = new Set();
  const [h, w] = [board.length, board[0].length];

  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (board[y][x])
        findNearbySpots(board, y, x).forEach((el) => {
          spots.add(el);
        });
  return Array.from(spots) as string[];
}
