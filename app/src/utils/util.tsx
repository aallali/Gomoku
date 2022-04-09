const { log } = console
function countTotal(
    board: string[][],
    curY: number,
    curX: number,
    dirXY: number[],
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
        if (board[tempY] && board[tempY][tempX] === now) {
            // number of consecutive pieces + 1
            total++;
        } else {
            break;
        }
    }

    return total;
}

export function findWinner(board: string[][], y: number, x: number) {
    const directions = {
        'top': [0, -1],
        'topRight': [1, -1],
        'topLeft': [-1, -1],
        'bottomRight': [1, 1],
        'bottomLeft': [-1, 1],
        'bottom': [0, 1],
        'right': [1, 0],
        'left': [-1, 0],
    }

    const connections = {
        'diagR': countTotal(board, y, x, directions['topRight']) + countTotal(board, y, x, directions['bottomLeft']),
        'diagL': countTotal(board, y, x, directions['bottomRight']) + countTotal(board, y, x, directions['topLeft']),
        'vertical': countTotal(board, y, x, directions['bottom']) + countTotal(board, y, x, directions['top']),
        'horizontal': countTotal(board, y, x, directions['right']) + countTotal(board, y, x, directions['left'])
    }

    if (
        connections['horizontal'] > 3 ||
        connections['vertical'] > 3 ||
        connections['diagL'] > 3 ||
        connections['diagR'] > 3
    )
        return board[y][x];

    // Check if there is no place left on the boar === DRAW === TIE
    if (board.every((row: string[]) => row.every((col: string) => col)))
        return "d";

    return
}
