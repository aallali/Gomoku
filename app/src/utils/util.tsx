const { log } = console;
let patterns = {
  'doubleFreeThree': [
    ['-1', '', '', '', '', '', '', ''],
    ['', '1', '', '', '', '', '', ''],
    ['', '', '1', '', '', '', '', ''],
    ['', '', '', '0', '', '', '', ''],
    ['', '', '', '0', '1', '1', '1', '-1'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
  ]
}
const paths: Record<string, string> = {
  right: "diagTL:diagBL",
  left: "diagTR:diagBR",
  top: "diagBR:diagBL",
  bottom: "diagTR:diagTL",
  diagTR: "left:bottom",
  diagTL: "right:bottom",
  diagBL: "top:right",
  diagBR: "top:left",
};
const directions: Record<string, number[]> = {
  top: [0, -1],
  right: [1, 0],
  diagTR: [1, -1],
  diagTL: [-1, -1],
  diagBR: [1, 1],
  diagBL: [-1, 1],
  bottom: [0, 1],
  left: [-1, 0],
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

  if (
    connections["horizontal"] > 3 ||
    connections["vertical"] > 3 ||
    connections["diagL"] > 3 ||
    connections["diagR"] > 3
  )
    return board[y][x];

  // Check if there is no place left on the boar === DRAW === TIE
  if (board.every((row: string[]) => row.every((col: string) => col)))
    return "d";

  return;
}

export function findCaptures(board: string[][], y: number, x: number) {
  const now: string = board[y][x];
  const enemy: string = now === "b" ? "w" : "b";
  const dirs: string[] = Object.keys(directions);

  for (let i = 0; i < dirs.length; i++) {
    let k = 2;
    let tmpY = y;
    let tmpX = x;
    const copyBoard = JSON.parse(JSON.stringify(board)); // create deep copy for the board
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
        copyBoard[tmpY][tmpX] = "";
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
        return copyBoard;
    }
  }

  return board;
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
const rotate: any = (matrix: string[][], turns: number | undefined) => {

  // Make the rows to become cols (transpose)
  const mtrx = matrix.map((_, i) => matrix.map(column => column[i]));
  // Reverse each row to get a rotated matrix
  const res = mtrx.map(row => row.reverse());
  if (turns && turns > 0)
    return rotate(res, --turns)
  return res
};
export function isDoubleFreeThree(
  board: string[][],
  y: number,
  x: number,
  curr: string
) {
  const doubleFreeThreePattern = patterns['doubleFreeThree']
  let copyBoard = JSON.parse(JSON.stringify(board)) // create deep copy for the board
  copyBoard[y][x] = curr
  copyBoard = trim(copyBoard, '')
  const enemy = curr === 'b' ? 'w' : curr
  let allRotates: string[][][] = [doubleFreeThreePattern]
  for (let i = 0; i < 3; i++) {
    allRotates.push(rotate(doubleFreeThreePattern, i))
  }
  log("--------")
  // allRotates.forEach((rot: string[][]) => {
  //   log(rot)
  //   log(findDoublePattern(copyBoard, curr, enemy, rot))
  // })
  log(allRotates[1])
log(findDoublePattern(copyBoard, curr, enemy, allRotates[0]))
log(findDoublePattern(copyBoard, curr, enemy, allRotates[1]))
// log(findDoublePattern(copyBoard, curr, enemy, allRotates[2]))


  return true



}


export function findDoublePattern(cboard: string[][], curr: string, enemy: string, doubleFreeThreePattern: string[][]) {

  let k = 0

  const board = JSON.parse(JSON.stringify(cboard))
  // doubleFreeThreePattern = trim(doubleFreeThreePattern, '')

  log(board, doubleFreeThreePattern)
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      k = 0
      for (let y = 0; y < doubleFreeThreePattern.length; y++) {
        for (let x = 0; x < doubleFreeThreePattern[y].length; x++) {
          // log(`i:${i},j:${j},y:${y},x:${x},`)
          if ((x + j) < board[0].length && (y + i) < board.length) {
            if ((doubleFreeThreePattern[y][x] === '1' && board[y + i][x + j] === curr)
              || (doubleFreeThreePattern[y][x] === '0' && board[y + i][x + j] === '')
              || (doubleFreeThreePattern[y][x] === '-1' && board[y + i][x + j] !== enemy))
              k++
          }
        }
      }
      if (k === 9)
        return true
     
    }
  }


  return false
}
function crop(board: string[][], ymin: number, ymax: number, xmin: number, xmax: number) {


  return board.slice(ymin - 1, ymax + 1).map(function (row) {
    return row.slice(xmin - 1, xmax + 2)
  });
}

function trim(board: string[][], toTrim: string) {
  let cmin, rmin, cmax, rmax

  cmin = board[0].length
  rmin = board.length
  cmax = -1
  rmax = -1

  for (let r = 0; r < board.length; r++)
    for (let c = 0; c < board[0].length; c++)
      if (board[r][c] !== toTrim) {
        if (cmin > c) cmin = c;
        if (cmax < c) cmax = c;
        if (rmin > r) rmin = r;
        if (rmax < r) rmax = r;
      }
  return crop(board, rmin, rmax, cmin, cmax);
}

