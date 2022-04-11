const { log } = console;

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

export function isDoubleFreeThree(
  board: string[][],
  y: number,
  x: number,
  curr: string
) {
  const copyBoard = JSON.parse(JSON.stringify(board)); // create deep copy for the board
  const now: string = curr;
  const enemy: string = now === "b" ? "w" : "b";
  const dirs = Object.keys(directions);
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
  for (let i = 0; i < dirs.length; i++) {
    const dir = dirs[i];
    let k = 2;
    let tmpY = y;
    let tmpX = x;

    while (k) {
      tmpY += directions[dir][1];
      tmpX += directions[dir][0];
      if (copyBoard[tmpY][tmpX] !== now) break;
      k--;
    }

    if (k === 0) {
      log(
        `Opposite paths for [${dir}] are : [${
          paths[dir]
        }] need to jump step ? [${(dir.includes("diag") && "yes") || "No"}]`
      );

      for (let j = 0; j < 2; j++) {
		tmpY = y;
		tmpX = x;
		if (dir.match(/diag/)) {
			log("===>", mirror[dir])
			
			tmpY += directions[mirror[dir]][1];
			tmpX += directions[mirror[dir]][0];
	   
		}

        const path = paths[dir].split(":")[j];

        k = 3;
        while (k) {
          tmpY += directions[path][1];
          tmpX += directions[path][0];
		 
          log(path, copyBoard[tmpY][tmpX]);
		  copyBoard[tmpY][tmpX] = 'r'
          k--;
        }
      }

      return copyBoard
    }
  }
  return copyBoard
}
