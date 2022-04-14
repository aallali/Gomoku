import React, { useEffect } from "react";
import { shallowEqual, useSelector } from "react-redux";
import styled from "styled-components";
import useBoard from "../utils/useBoard";
import Chess from "./Chess";




const Checkerboard = styled.div`
  display: inline-block;
  margin-top: 0;
  background: #c19d38;
  padding:30px;
  border-radius:5px
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
function aiMove(board: string[][]): number[] {
  const row = generateRandom()
  const col = generateRandom()
  if (board[row][col])
    return aiMove(board)
  else
    return [row, col]
}

export default function Gomoku() {
  const options: any = useSelector(
    (state: GomokuState) => state,
    shallowEqual
  )
  const isMyTurn: any = useSelector(
    (state: GomokuState) => state.myTurn,
    shallowEqual
  )
  const enemy = options.enemy
  const player = options.player
  const { board, wineer, handleChessClick } = useBoard(options.mode, options.enemy, options.player, isMyTurn);
  const colors: any = useSelector(
    (state: GomokuState) => state.color,
    shallowEqual
  )

  useEffect(() => {
    let timer: any

    if (!isMyTurn && enemy === 'ai') {
      const [row, col] = aiMove(board)
      timer = setTimeout(() => {
        handleChessClick(row, col, '')
      }, 500)

    } else if (isMyTurn && player === 'ai') {

      const [row, col] = aiMove(board)
      timer = setTimeout(() => {
        handleChessClick(row, col, '')
      }, 500)

    }
    if (timer)
      return () => clearTimeout(timer);
  }, [isMyTurn])
  return (
    <div>

      {wineer && (
        <WinnerModal>
          <ModalInner>
            {wineer === "d" && "Tie"}
            {wineer === "b" && "Black wins"}
            {wineer === "w" && "White wins"}
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
