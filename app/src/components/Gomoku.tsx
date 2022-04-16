import React, { useEffect } from "react";
import { shallowEqual, useSelector } from "react-redux";
import styled from "styled-components";
import useBoard from "../utils/useBoard";
import Chess from "./Chess";
import { getAvailableSpots } from "../utils/util"
import {
  findWinner,
  findCaptures,
  isForbiddenMove,
  isDoubleFreeThree,
} from "../utils/util";

const { log } = console
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

function generateRandom(maxLimit = 19) {
  let rand = Math.random() * maxLimit;
  rand = Math.floor(rand); // 99
  return rand;
}
function aiMove(
  board: string[][],
  isBlackMoving: any,
  recur: number
): number[] | boolean[] {
  if (recur === 0)
    return [false, false]


  const availableSpots: string[] = getAvailableSpots(board)
 
  const randomMove: string = availableSpots[Math.floor(Math.random() * availableSpots.length)];
  const row = randomMove ?  parseInt(randomMove.split(',')[0]) : 0
  const col = randomMove ? parseInt(randomMove.split(',')[1]) : 0

  if (
    !board[row][col] &&
    !isForbiddenMove(board, row, col, isBlackMoving.current ? "b" : "w") &&
    !isDoubleFreeThree(board, row, col, isBlackMoving.current ? "b" : "w")
  ) {


    return [row, col];

  } else return aiMove(board, isBlackMoving, --recur);
}

export default function Gomoku({ winner }: any) {
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

  const colors: any = useSelector(
    (state: GomokuState) => state.color,
    shallowEqual
  );

  useEffect(() => {
    let timer: any;
    if (!winner) {
      if (!isMyTurn && enemy === "ai") {

        const [row, col] = aiMove(board, isBlackMoving, 1000);

        if (row || row === 0)
          timer = setTimeout(() => {
            handleChessClick(row, col, "", true);
          }, 1);
        else clearTimeout(timer);
      } else if (isMyTurn && player === "ai") {

        const [row, col] = aiMove(board, isBlackMoving, 1000);

        if (row || row === 0)
          timer = setTimeout(() => {
            handleChessClick(row, col, "", true);
          }, 1);
        else clearTimeout(timer);
      }
    }
    if (timer) return () => clearTimeout(timer);
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
        {board.map((row, rowIndex) => {
          return (
            <Row key={rowIndex}>
              {row.map((col: any, colIndex: number) => {
                return (
                  <Chess
                    colors={colors}
                    key={colIndex}
                    row={rowIndex}
                    col={colIndex}
                    value={board[rowIndex][colIndex]}
                    onClick={handleChessClick}
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
