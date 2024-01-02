import type GO from "@/gomoku/GO";

export class Minimax {
  static timeoutMillis = 550; // time depth limit
  static startMillis = Date.now();

  static minimax(node: typeof GO, depth: number, alpha: number, beta: number, maximizingPlayer: boolean): number {


    const recursiveMinimax = (node: typeof GO, depth: number, alpha: number, beta: number, maximizingPlayer: boolean): number => {
      if (depth === 0 || node.winner || Date.now() - this.startMillis > Minimax.timeoutMillis) {
        if (node.winner === 1) return 33333
        if (node.winner === 2) return 88888
        return 0
      }

      node.generateChildren();

      if (maximizingPlayer) {
        let maxEval = Number.NEGATIVE_INFINITY;

        for (const child of node.children) {
          const score = recursiveMinimax(child, depth - 1, alpha, beta, false);
          maxEval = Math.max(maxEval, score);
          alpha = Math.max(alpha, score);

          if (beta <= alpha) {
            break; // Beta cutoff
          }
        }

        return maxEval - (5 - depth);

      } else {

        let minEval = Number.POSITIVE_INFINITY;

        for (const child of node.children) {
          const score = recursiveMinimax(child, depth - 1, alpha, beta, true);
          minEval = Math.min(minEval, score);
          beta = Math.min(beta, score);

          if (beta <= alpha) {
            break; // Alpha cutoff
          }
        }

        return minEval + (5 - depth); // Apply penalty for minimizing player
      }
    };

    return recursiveMinimax(node, depth, alpha, beta, maximizingPlayer);
  }

  static findBestMove(initialState: typeof GO, depth: number, _delete?: boolean): any {
    const root = initialState

    let bestMove: typeof GO | null = null;
    let maximizingPlayer = true
    let bestValue = maximizingPlayer ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
    root.generateChildren();
    console.time("AllmovesMinimax:")
    console.log(`Total moves checked : ${root.children.length}`)
    if (root.children.length > 1 && root.moves.length >= 5) {
      this.startMillis = Date.now();
      for (const child of root.children) {
        const score = Minimax.minimax(child, depth - 1, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, !maximizingPlayer) + (child.lastPlayed.score || 0);
        console.log(`Minimax score: {x:${child.lastPlayed.x} ,y: ${child.lastPlayed.y}} | score: ${score}`, child.winner || "")
        if (
          (maximizingPlayer && score > bestValue)
          || (!maximizingPlayer && score < bestValue)) {
          bestValue = score;
          bestMove = child;
        }
      }
    } else {
      bestValue = root.children[0].lastPlayed.score || -1;
      bestMove = root.children[0];
    }

    console.log(`Best by Heuristic: {x: ${root.children[0].lastPlayed.x}, y: ${root.children[0].lastPlayed.y}}`)
    console.log(`Best by MiniMax: {x: ${bestMove?.lastPlayed.x}, y: ${bestMove?.lastPlayed.y}}`, bestValue)
    console.timeEnd("AllmovesMinimax:")
    return bestMove?.lastPlayed;
  }
}

