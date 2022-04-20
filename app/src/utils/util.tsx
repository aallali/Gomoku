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
  diagBL: [-1, 1]
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
  let foundCapture = false
  let copyBoard
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
        board = copyBoard
      foundCapture = true
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
  fiveInRow: ['11111'],
  openFourDouble: ['011110'],
  openFour: [
    '11110',
    '11101',
    '11011',
    '10111',
    '01111'
  ],
  openFourBroken: ['011112', '211110'],
  openThree: [
    '01110',
    '01011',
    '10101'
  ],
  openThreeBroken: [
    '01112',
    '010112'
  ],
  capture: ['1220', '0221'],

  openThreeBrokenCovered: ['2011102'],
  openTwo: ['01010', '01100'],
  openTwoBroken: ['01120', '01012'],

  twoCoverTwo: ['010010'],
  twoCoverTwoBroken: ['10012'],
  twoCoverThree: ['10001'],

  close: ['10', '01']
}

const scores: Record<string, number> = {
  fiveInRow: 500000,
  openFourDouble: 2000,
  openFour: 1500,
  openFourBroken: 1400,
  openThree: 1000,
  openThreeBroken: 250,
  capture: 200,
  openThreeBrokenCovered: 175,
  openTwo: 150,
  openTwoBroken: 100,
  twoCoverTwo: 60,
  twoCoverTwoBroken: 30,
  twoCoverThree: 10,
  close: 0


}

export function get5PiecesDoubleDirection(board: string[][], y: number, x: number, direction: { x: number, y: number }, player: string) {
  let res = []
  let [tmpY, tmpX] = [y, x]

  for (let i = 0; i < 5; i++) {
    tmpY -= direction.y
    tmpX -= direction.x
    res.push(board[tmpY]?.[tmpX])
  }
  res.reverse()
  res.push(board[y]?.[x]);
  // reset temp coordination
  [tmpY, tmpX] = [y, x]
  for (let i = 0; i < 5; i++) {
    tmpY += direction.y
    tmpX += direction.x
    res.push(board[tmpY]?.[tmpX])
  }
  res = res.map(l => {
    if (l === undefined)
      return ""
    if (l === null)
      return 0
    if (l === player)
      return 1
    return 2
  })
  return res.join("")
}
function getPossibleMoves(board: string[][], player: string) {

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
  let score = 0
  const dirs: string[] = Object.keys(directions);
  const patternKys: string[] = Object.keys(patterns)
  for (let i = 0; i < 19; i++) {
    for (let j = 0; j < 19; j++) {
      if (board[i][j] === player) {
        for (let k = 0; k < dirs.length; k++) {
          const direction = { x: directions[dirs[k]][0], y: directions[dirs[k]][1] }
          const doubleRow = get5PiecesDoubleDirection(board, i, j, direction, player)
          // log(doubleRow, dirs[k])
          // eslint-disable-next-line no-loop-func
          patternKys.forEach((key: string) => {
            patterns[key].forEach(path => {
              if (doubleRow.includes(path)) {
                // log(key, doubleRow, "--", path, doubleRow.includes(path))

                score += scores[key]
              }
            })
          })
        }
      }
    }
  }
  return score
}

export function bestMoveInState(board: string[][], player: string) {
  const moves = getPossibleMoves(board, player)
  let move: { x: number, y: number } = { x: 9, y: 9 }
  let bestScore = 0

  for (let i = 0; i < moves.length; i++) {
    const fakeBoard = JSON.parse(JSON.stringify(board))
    fakeBoard[moves[i].y][moves[i].x] = player
    if (findWinner(fakeBoard, moves[i].y, moves[i].x)) {
      move = moves[i]
      break
    }else {
    const score = minimax(fakeBoard, player === "b" ? "w" : "b", 2, true, 555, -555)

    if (score >= bestScore) {
      bestScore = score
      move = moves[i]
    }}
  }
  return move

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
  let spots = []

  for (let k in directions) {
    let checkSpot = board[y + directions[k][1]]?.[x + directions[k][0]]
    if (checkSpot === null)
      spots.push(`${y + directions[k][1]},${x + directions[k][0]}`)
  }
  return spots
}

export function getAvailableSpots(board: string[][]) {
  const spots = new Set()
  const [h, w] = [board.length, board[0].length]

  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (board[y][x])
        findNearbySpots(board, y, x).forEach(el => {
          spots.add(el)
        })
  return Array.from(spots) as string[]
}




