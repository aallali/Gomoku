import { findWinner, getAvailableSpots, isDoubleFreeThree, isForbiddenMove } from './util'
const min = Math.min,
    max = Math.max
/**
 def minimax(state, max_depth, is_player_minimizer, alpha, beta):
    if max_depth == 0 or state.is_end_state():
        return evaluation_function(state)

    if is_player_minimizer:
        value = -math.inf
        for move in state.possible_moves():
            evaluation = minimax(move, max_depth - 1, False, alpha , beta)
            min = min(value, evaluation)
            # Keeping track of our current best score
            beta = min(beta, evaluation)
            if beta <= alpha:
                break
        return value

    value = math.inf
    for move in state.possible_moves():
        evaluation = minimax(move, max_depth - 1, True, alpha, beta)
        max = max(value, evaluation)
        # Keeping track of our current best score
        alpha = max(alpha, evaluation)
        if beta <= alpha:
            break
    return value
 */
function evalMove(board: string[][]) {
    if (checkWinner(board)) { console.log(board);return 5000 }
    return  1
}
function getPossibleMoves(board: string[][], player: string) {
    let moves = getAvailableSpots(board).filter((l: string) => {
        let y = parseInt(l.split(',')[0])
        let x = parseInt(l.split(',')[1])
        const isInCaptureMove = isForbiddenMove(board, y, x, player)
        const isDouble = isDoubleFreeThree(board, y, x, player)
        return (!(isInCaptureMove && isDouble))
    }).map((l: string) => ({ y: parseInt(l.split(',')[0]), x: parseInt(l.split(',')[1]) }))

    return moves as { x: number, y: number }[]
}
// def minimax(state, max_depth, is_player_minimizer):
//     if max_depth == 0 or state.is_end_state():
//         # We're at the end. Time to evaluate the state we're in
//         return evaluation_function(state)

//     # Is the current player the minimizer?
//     if is_player_minimizer:
//         value = -math.inf
//         for move in state.possible_moves():
//             evaluation = minimax(move, max_depth - 1, False)
//             min = min(value, evaluation)
//         return value

//     # Or the maximizer?
//     value = math.inf
//     for move in state.possible_moves():
//         evaluation = minimax(move, max_depth - 1, True)
//         max = max(value, evaluation)
//     return value
function checkWinner(board: string[][]) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            const winner = findWinner(board, i, j)
            if (winner) return winner
        }
    }
    return
}
export default function minimax(board: string[][], player: string, maxDepth: number, isMinimizer: boolean, alpha: number, beta: number) {
    let enemy = isMinimizer ? "w" : "b"

    if (!maxDepth)
        return evalMove(board)
    let value
    let moves = getPossibleMoves(board, player)

    if (isMinimizer) {
        value = Infinity
        for (let i = 0; i < moves.length; i++) {
            const move = moves[i]
            const copyBoard = JSON.parse(JSON.stringify(board))
            copyBoard[move.y][move.x] = player
            const score = minimax(copyBoard, enemy, maxDepth - 1, true, alpha, beta)

            value = min(score, value)


        }
        return value
    } else {
        value = -Infinity
        for (let i = 0; i < moves.length; i++) {
            const move = moves[i]
            const copyBoard = JSON.parse(JSON.stringify(board))
            copyBoard[move.y][move.x] = player
            const score = minimax(copyBoard, enemy, maxDepth - 1, false, alpha, beta)
            value = max(score, value)

        }
        return value
    }
}