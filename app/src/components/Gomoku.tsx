import React, { useEffect, useState } from "react";
import { shallowEqual, useSelector } from "react-redux";
import styled from "styled-components";
import useBoard from "../utils/useBoard";
import Chess from "./Chess";
import { bestMoveInState, getAvailableSpots, heuristic } from "../utils/util"
import {
  isForbiddenMove,
  isDoubleFreeThree,
} from "../utils/util";
import minimax from "../utils/miniMax";

// const { log } = console
const Checkerboard = styled.div`
  display: inline-block;
  margin-top: 0;
  background: #c19d38;
  padding: 30px;
  border-radius: 5px;
`;

const Row = styled.div`
  display: flex;
`;

const WinnerModal = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
`;

const ModalInner = styled.div`
  background: white;
  color: black;
  height: 300px;
  width: 300px;
  padding: 24px;
  text-align: center;
`;


function aiMove(
  board: string[][],
  isBlackMoving: any,
  aspots: string[],
  start: boolean
): number[] | boolean[] {
  if (aspots.length === 0 && !start) {
    // log(getAvailableSpots(board))
    return [false, false]
  }

 
  const randomMove: string = aspots[Math.floor(Math.random() * aspots.length)];
  const row = randomMove ? parseInt(randomMove.split(',')[0]) : 1
  const col = randomMove ? parseInt(randomMove.split(',')[1]) : 1
  if (!(board[row][col] ||
    isForbiddenMove(board, row, col, isBlackMoving.current ? "b" : "w") ||
    isDoubleFreeThree(board, row, col, isBlackMoving.current ? "b" : "w")))
    return [row, col];
  else {
    aspots = aspots.filter(l => l !== randomMove)
    return aiMove(board, isBlackMoving, aspots, false)
  }

}

export default function Gomoku({ winner }: any) {

  const [moves, setMoves] = useState<string[]>([])
  const options: any = useSelector((state: GomokuState) => state);
  const isMyTurn: any = useSelector(
    (state: GomokuState) => state.myTurn,
    shallowEqual
  );

  const enemy = options.enemy;
  const player = options.player;
  const { board, handleChessClick, isBlackMoving } = useBoard(
    options.mode,
    options.enemy,
    options.player,
    isMyTurn
  );

  function getOrder(rowCol: string) {
    let biggestIndex = 0
    for (let i = 0; i < moves.length; i++) {
      if (moves[i] === rowCol) {
        if (i > biggestIndex)
          biggestIndex = i
      }
    }
    return biggestIndex
  }
  function storeAndHandleChessClick(row: number, col: number, value: string, bot: boolean) {

    if (handleChessClick(row, col, value, bot))
      setMoves(prev => [...prev, `${row},${col}`])
  }
  const colors: any = useSelector(
    (state: GomokuState) => state.color,
    shallowEqual
  );

  useEffect(() => {
    let timer: any;
    if (!winner) {
      if (!isMyTurn && enemy === "ai") {
        console.log('->', isBlackMoving.current ? 'b': 'w')
        const move = bestMoveInState(board, isBlackMoving.current ? 'w': 'b') 
         timer = setTimeout(() => {
          storeAndHandleChessClick(move.y as number, move.x as number, "", true);
         }, 300)
        
         
     
      } else if (isMyTurn && player === "ai") {
        console.log(isBlackMoving.current ? 'b': 'w')
        const move = bestMoveInState(board, isBlackMoving.current? 'b': 'w') 
        timer = setTimeout(() => {
          storeAndHandleChessClick(move.y as number, move.x as number, "", true);
         }, 300)
        
      
      }
    }
    if (timer) return () => clearTimeout(timer);
   
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMyTurn]);

  return (
    <div>
      {winner && (
        <WinnerModal>
          <ModalInner>
            {winner === "d" && "Tie"}
            {winner === "b" && "Black wins"}
            {winner === "w" && "White wins"}
            <br />
            <button onClick={() => window.location.reload()}>Play Again</button>
          </ModalInner>
        </WinnerModal>
      )}

      <Checkerboard>
        {board.map((row:any, rowIndex:number) => {
          return (
            <Row key={rowIndex}>
              {row.map((col: any, colIndex: number) => {
                return (
                  <Chess
                    colors={colors}
                    key={colIndex}
                    row={rowIndex}
                    col={colIndex}
                    order={getOrder(`${rowIndex},${colIndex}`) || 0}
                    value={board[rowIndex][colIndex]}
                    onClick={storeAndHandleChessClick}
                  />
                );
              })}
            </Row>
          );
        })}
      </Checkerboard>
    </div>
  );
}
