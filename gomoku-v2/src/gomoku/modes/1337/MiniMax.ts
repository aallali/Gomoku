import type GO from "@/gomoku/GO";
import type { P } from "@/gomoku/types/gomoku.type";

export class Minimax {
  static timeoutMillis = 2000; // time depth limit
  static startMillis = performance.now();
  static playerToWin: P = 1
  static maxDepth: number = 10
  static minimax(node: typeof GO, depth: number, alpha: number, beta: number, maximizingPlayer: boolean): number {

    const recursiveMinimax = (node: typeof GO, depth: number, alpha: number, beta: number, maximizingPlayer: boolean): number => {
      if (depth > 1)
        if (
          ((performance.now() - this.startMillis) > Minimax.timeoutMillis)
          || depth === this.maxDepth
          || node.winner
        ) {
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

  static async findBestMove(initialState: typeof GO) {
    this.startMillis = performance.now()
    const root = initialState
    this.playerToWin = initialState.turn

    let bestMove = {} as typeof GO;
    let maximizingPlayer = true
    let bestScore = maximizingPlayer ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
    root.generateChildren();
    console.log(`>> Total moves being checked : [${root.children.length}]`)
    let minimaxTimeCost = 0

    let endTime = 0
    if (root.children.length > 1 && root.moves.length >= 5) {
      this.startMillis = performance.now();
      // for (const child of root.children) {
      //   const score = Minimax.minimax(child, 1, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, !maximizingPlayer)
      //   console.log(`:--: mmax score: {x:${child.lastPlayed.x} ,y: ${child.lastPlayed.y}} | score: ${score} | time : ${(performance.now()-this.startMillis)/1000}`, child.winner || "")
      //   if (score >= 88888) {
      //     console.log("..........>>>>>", score)
      //     bestValue = score;
      //     bestMove = child;
      //     break
      //   }
      //   if (
      //     (maximizingPlayer && score > bestValue)
      //     || (!maximizingPlayer && score < bestValue)) {
      //     bestValue = score;
      //     bestMove = child;
      //   }
      // }

      const minimaxPromises: Promise<number>[] = root.children.map((child, i) => {
        return new Promise((resolve) => {
          const tmpStr = performance.now();

          const score = Minimax.minimax(child, 1, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, !maximizingPlayer);
          console.log(`:--: [${i}] mmax score: {x:${child.lastPlayed.x} ,y: ${child.lastPlayed.y}} | score: ${score} | time : ${(performance.now() - tmpStr) / 1000}`, child.winner || "")
          resolve(score)
        });
      });


      const scores = await Promise.all(minimaxPromises)

      // Now 'scores' is an array containing the results of all minimax calculations
      // Perform sorting or any other post-processing logic here
      const sortedMoves = root.children
        .map((child, index) => ({ move: child, score: scores[index] }))
        .sort((a, b) => b.score - a.score);

      // Access the best move and its score
      bestMove = sortedMoves[0].move;
      bestScore = sortedMoves[0].score;

      console.log(`Best Move: {x:${bestMove.lastPlayed.x}, y:${bestMove.lastPlayed.y}} | Score: ${bestScore}`);


      endTime = performance.now()

    } else {
      console.log("ooooo")
      bestScore = root.children[0].lastPlayed.score || -1;
      bestMove = root.children[0];
      endTime = performance.now()
    }
    minimaxTimeCost = endTime - this.startMillis
    console.log(this.startMillis, endTime)
    console.log(`Best by Heuristic: {x: ${root.children[0].lastPlayed.x}, y: ${root.children[0].lastPlayed.y}}`)
    console.log(`Best by MiniMax: {x: ${bestMove.lastPlayed.x}, y: ${bestMove.lastPlayed.y}}`, bestScore)

    return { bestMove: bestMove.lastPlayed, timeCost: minimaxTimeCost / 1000 }
  }
}

