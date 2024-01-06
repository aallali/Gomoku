
import GO, { go } from "../../GO";
import { Minimax } from "./MiniMax";
import type { P } from "../../types/gomoku.type";


self.onmessage = (e: MessageEvent<string>) => {

    const { i, child, pToWin, thinkTime, } = e.data as unknown as { i: number, child: typeof GO; pToWin: P, thinkTime: number }

    if (i === undefined || !child)
        return

    const node = new go()
 
    node.backup_matrix = child.backup_matrix
    node.bestMoves = child.bestMoves
    node.lastPlayed = child.lastPlayed
    node.log = false
    node.matrix = child.matrix
    node.moves = child.moves
    node.winner = child.winner
    node.players = child.players
    node.recentBreakableWin = child.recentBreakableWin
    node.size = child.size
    node.turn = child.turn
 
    const minimaxRunner = new Minimax(performance.now(), thinkTime, '_')
    minimaxRunner.playerToWin = pToWin

    const startTime = performance.now();
  
    const score = minimaxRunner.minimax(node, 1, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, false);
    const endTime = (performance.now() - startTime) / 1000
    self.postMessage({ score, move: child.lastPlayed, time: endTime });
    console.log(`:--: [${i}][T:${pToWin}] mmax score: {x:${child.lastPlayed.x} ,y: ${child.lastPlayed.y}} | score: ${score} | time : ${endTime}`, node.winner || "")
};

export { }
