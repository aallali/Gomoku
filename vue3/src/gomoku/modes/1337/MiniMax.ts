import type GO from "@/gomoku/GO";
import type { P } from "@/gomoku/types/gomoku.type";

export class Minimax {
  static minimax(node: typeof GO, depth: number, alpha: number, beta: number, maximizingPlayer: boolean): number {
    if (depth === 0 || node.winner) {
      if (node.winner === 1) return -99999
      if (node.winner === 2) return 99999

      return  0
    }
    
    node.generateChildren();
  
    if (maximizingPlayer) {
      let maxEval = Number.NEGATIVE_INFINITY;
  
      for (const child of node.children) {
        const score = Minimax.minimax(child, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, score);
        alpha = Math.max(alpha, score);
  
        if (beta <= alpha) {
          break; // Beta cutoff
        }
      }
  
      return maxEval;
    } else {
      let minEval = Number.POSITIVE_INFINITY;
  
      for (const child of node.children) {
        const score = Minimax.minimax(child, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, score);
        beta = Math.min(beta, score);
  
        if (beta <= alpha) {
          break; // Alpha cutoff
        }
      }
  
      return minEval;
    }
  }
  

  static findBestMove(initialState: typeof GO, depth: number, _delete?: boolean): any {
    const root = initialState

    let bestMove: typeof GO | null = null;
    let maximizingPlayer = true
    let bestValue = maximizingPlayer ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
    root.generateChildren();
    console.log("----------->", root.turn)
    console.time("AllmovesMinimax:")

    for (const child of root.children) {
      // console.time("moveMinimax:")
      const score = Minimax.minimax(child, depth - 1, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, !maximizingPlayer) + (child.lastPlayed.score || 0);

      // console.log(child.lastPlayed, score - (child.lastPlayed.score || 0))
      if (
        (maximizingPlayer && score > bestValue)
        || (!maximizingPlayer && score < bestValue)) {
        bestValue = score;
        bestMove = child;
      }
      // console.timeEnd("moveMinimax:")
    }
    console.log(`Best for (${root.turn===1? 'Black' : 'White'})::`,bestMove?.lastPlayed, bestValue)
    console.timeEnd("AllmovesMinimax:")
 
    return bestMove;
  }
}

