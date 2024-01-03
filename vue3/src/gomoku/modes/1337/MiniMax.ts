import type GO from "@/gomoku/GO";
import type { P } from "@/gomoku/types/gomoku.type";

export class Minimax {
  static timeoutMillis = 500; // time depth limit
  static startMillis = Date.now();
  static playerToWin: P = 1
  static maxDepth: number = 10
  static minimax(node: typeof GO, depth: number, alpha: number, beta: number, maximizingPlayer: boolean): number {

    const recursiveMinimax = (node: typeof GO, depth: number, alpha: number, beta: number, maximizingPlayer: boolean): number => {
      if (depth > 1)
        if (depth === this.maxDepth || node.winner || Date.now() - this.startMillis > Minimax.timeoutMillis) {

          if (node.winner) {
            if (node.winner === "T")
              return 0

            return 88888 * (node.winner === this.playerToWin ? 1 : -1)
          }

          // J7,I6,K6,I8,L5,I7,I5,H8,G8,J8,K9,H6,G6,J6,G9,G10,G7,G5,F4,H9,H10,I11
          return maximizingPlayer ? node.players[this.playerToWin].captures - node.players[3 - this.playerToWin as P].captures : node.players[3 - this.playerToWin as P].captures - node.players[this.playerToWin].captures
        }

      node.generateChildren();

      if (maximizingPlayer) {
        let maxEval = Number.NEGATIVE_INFINITY;

        for (const child of node.children) {
          const score = recursiveMinimax(child, depth + 1, alpha, beta, false);
          maxEval = Math.max(maxEval, score);
          alpha = Math.max(alpha, score);

          if (beta <= alpha) {
            break; // Beta cutoff
          }
        }

        return maxEval

      } else {

        let minEval = Number.POSITIVE_INFINITY;

        for (const child of node.children) {
          const score = recursiveMinimax(child, depth + 1, alpha, beta, true);
          minEval = Math.min(minEval, score);
          beta = Math.min(beta, score);

          if (beta <= alpha) {
            break; // Alpha cutoff
          }
        }

        return minEval // Apply penalty for minimizing player
      }
    };

    return recursiveMinimax(node, depth, alpha, beta, maximizingPlayer);
  }

  static findBestMove(initialState: typeof GO) {
    let startTime = performance.now()
    const root = initialState
    this.playerToWin = initialState.turn

    let bestMove = {} as typeof GO;
    let maximizingPlayer = true
    let bestValue = maximizingPlayer ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
    root.generateChildren();
    console.time("AllmovesMinimax:")
    console.log(`Total moves being checked : [${root.children.length}]`)
    let minimaxTimeCost = 0

    let endTime = 0
    if (root.children.length > 1 && root.moves.length >= 5) {

      startTime = performance.now()

      this.startMillis = Date.now();
      miniMaxLoop: for (const child of root.children) {
        const score = Minimax.minimax(child, 1, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, !maximizingPlayer)
        console.log(`:--------: mmax score: {x:${child.lastPlayed.x} ,y: ${child.lastPlayed.y}} | score: ${score}`, child.winner || "")
        if (score >= 88888) {
          bestValue = score;
          bestMove = child;
          break miniMaxLoop
        }
        if (
          (maximizingPlayer && score > bestValue)
          || (!maximizingPlayer && score < bestValue)) {
          bestValue = score;
          bestMove = child;
        }
      }
      endTime = performance.now()

    } else {
      bestValue = root.children[0].lastPlayed.score || -1;
      bestMove = root.children[0];
      endTime = performance.now()
    }
    minimaxTimeCost = endTime - startTime

    console.log(`Best by Heuristic: {x: ${root.children[0].lastPlayed.x}, y: ${root.children[0].lastPlayed.y}}`)
    console.log(`Best by MiniMax: {x: ${bestMove.lastPlayed.x}, y: ${bestMove.lastPlayed.y}}`, bestValue)

    return { bestMove: bestMove.lastPlayed, timeCost: minimaxTimeCost / 1000 }
  }
}

