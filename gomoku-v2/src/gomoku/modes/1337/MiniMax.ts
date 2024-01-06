import type GO from "@/gomoku/GO";
import type { P } from "@/gomoku/types/gomoku.type";

export class Minimax {
  timeoutMillis; // time depth limit
  startMillis = performance.now();
  playerToWin: P = 1
  maxDepth: number = 10
  workerUrl: string
  constructor(st: number, timeoutLimit: number, workerUrl: string) {
    this.startMillis = st
    this.workerUrl = workerUrl
    this.timeoutMillis = timeoutLimit
  }
  /**
   * Minimax algorithm for calculating the best move in a given game state.
   * @param node - The current game state node.
   * @param depth - The depth of the recursion in the minimax tree.
   * @param alpha - The alpha value for alpha-beta pruning.
   * @param beta - The beta value for alpha-beta pruning.
   * @param maximizingPlayer - Indicates whether it's the turn of the maximizing player.
   * @returns The score of the best move calculated by the minimax algorithm.
   */
  minimax(node: typeof GO, depth: number, alpha: number, beta: number, maximizingPlayer: boolean): number {
    /**
     * Recursive function for the minimax algorithm.
     * @param node - The current game state node.
     * @param depth - The depth of the recursion in the minimax tree.
     * @param alpha - The alpha value for alpha-beta pruning.
     * @param beta - The beta value for alpha-beta pruning.
     * @param maximizingPlayer - Indicates whether it's the turn of the maximizing player.
     * @returns The score of the best move calculated by the minimax algorithm.
     */
    const recursiveMinimax = (
      node: typeof GO,
      depth: number,
      alpha: number,
      beta: number,
      maximizingPlayer: boolean
    ): number => {
      // Check for termination conditions.
      if (
        depth === this.maxDepth
        || node.winner
        || ((performance.now() - this.startMillis) >= this.timeoutMillis)
      ) {
        if (node.winner) {
          if (node.winner === "T") {
            return 0; // Tie
          }
          // Return a high score if the player wins, penalize based on depth.
          return (88888 * (node.winner === this.playerToWin ? 1 : -1)) - depth;
        }

        // Return the captures difference if the game is not terminated.
        return maximizingPlayer
          ? node.players[this.playerToWin].captures - node.players[3 - this.playerToWin as P].captures
          : node.players[3 - this.playerToWin as P].captures - node.players[this.playerToWin].captures;
      }

      // Generate children nodes for the current state.
      node.generateChildren();

      if (maximizingPlayer) {
        // Maximizing player's turn.
        let maxEval = Number.NEGATIVE_INFINITY;

        for (const child of node.children) {
          // Recursively calculate the score for each child node.
          const score = recursiveMinimax(child, depth + 1, alpha, beta, false);
          maxEval = Math.max(maxEval, score);
          alpha = Math.max(alpha, score);

          if (beta <= alpha) {
            break; // Beta cutoff
          }
        }

        return maxEval;
      } else {
        // Minimizing player's turn.
        let minEval = Number.POSITIVE_INFINITY;

        for (const child of node.children) {
          // Recursively calculate the score for each child node.
          const score = recursiveMinimax(child, depth + 1, alpha, beta, true);
          minEval = Math.min(minEval, score);
          beta = Math.min(beta, score);

          if (beta <= alpha) {
            break; // Alpha cutoff
          }
        }

        return minEval; // Apply penalty for minimizing player
      }
    };

    // Start the recursive minimax algorithm.
    return recursiveMinimax(node, depth, alpha, beta, maximizingPlayer);
  }

  /**
   * Finds the best move based on the given initial state.
   * @param initialState - The initial state of the game.
   * @returns An object containing the best move and the time cost of the minimax algorithm.
   */
  async findBestMove(initialState: typeof GO) {
    // console.clear()

    const root = initialState;
    this.playerToWin = initialState.turn;
    this.startMillis = performance.now();

    let bestMove = {} as { x: number; y: number };
    let bestScore = Number.NEGATIVE_INFINITY;
    let minimaxTimeCost = 0;

    root.generateChildren();

    if (root.children.length > 1 && root.moves.length >= 4) {
      // Concurrently calculate scores for all child nodes.

      const scores = await Promise.all(root.children.map((child, i) => this.calculateScore(child, i)));
      const sortedMoves = scores.sort((a, b) => b.score - a.score);

      // Extract the best move and score.
      bestMove = sortedMoves[0].move;
      bestScore = sortedMoves[0].score;

      // Calculate the average time cost of the minimax algorithm.
      const sum = scores.reduce((acc, num) => acc + num.time, 0);
      minimaxTimeCost = parseFloat((sum / scores.length).toFixed(2));
    } else {
      // If there's only one child, use it as the best move.
      if (root.moves.length === 1) {
        const bestChild = root.children[0];
        bestScore = bestChild.lastPlayed.score || -1;
        bestMove = bestChild.lastPlayed;
      } else {
        const bestChild = root.children[0];
        bestScore = bestChild.lastPlayed.score || -1;
        bestMove = bestChild.lastPlayed;
      }

      minimaxTimeCost = (performance.now() - this.startMillis) / 1000;
    }

    // Log the results.
    console.log(`:---> Total moves checked: [${root.children.length}]`);
    console.log(`Best by Heuristic: {x: ${root.children[0].lastPlayed.x}, y: ${root.children[0].lastPlayed.y}}`);
    console.log(`Best by MiniMax: {x: ${bestMove.x}, y: ${bestMove.y}}`, bestScore);

    return { bestMove, timeCost: minimaxTimeCost };
  }

  /**
   * Calculates the score for a given child node using the minimax algorithm.
   * @param child - The child node to calculate the score for.
   * @param i - The index of the child node.
   * @returns A promise containing the score, move, and time taken for the calculation.
   */
  private async calculateScore(child: typeof GO, i: number): Promise<{ score: number; move: { x: number; y: number }; time: number }> {
    return new Promise((resolve) => {
      const tims = this.timeoutMillis
      const wrk = new Worker(this.workerUrl, { type: 'module' })

      // Handle the message from the worker.
      wrk.onmessage = (e: any) => resolve(e.data);

      // // Post the message to the worker to calculate the score.
      wrk.postMessage({ i, child, pToWin: this.playerToWin, thinkTime: tims });
    });
  }
}

