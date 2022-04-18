import { useState, useRef, useCallback, useEffect } from "react";
import { findWinner, findCaptures, isForbiddenMove, isDoubleFreeThree } from "./util";
import { updateCurrentPlayer, setTurn, setWinner } from "../store/actionCreators"
import { Dispatch } from "redux"
import { useDispatch} from "react-redux"
const SIZE = 19;

// const { log } = console
// let demoBoard = [
//   [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
//   [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
//   [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
//   [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "b", " ", " ", " ", " ", " ", " ", " ", " "],
//   [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "b", " ", " ", " ", " ", " ", " ", " "],
//   [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
//   [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "b", "b", " ", " ", " "],
//   [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
//   [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
//   [" ", " ", " ", " ", " ", " ", "b", " ", " ", " ", " ", " ", " ", "b", " ", " ", " ", " ", " "],
//   [" ", " ", " ", " ", " ", " ", " ", "b", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
//   [" ", " ", " ", " ", " ", "b", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
//   [" ", " ", " ", " ", "w", " ", " ", " ", " ", " ", "b", "b", " ", " ", " ", " ", " ", " ", " "],
//   [" ", " ", " ", "w", " ", " ", " ", " ", " ", "w", " ", " ", " ", " ", " ", " ", " ", " ", " "],
//   [" ", " ", " ", " ", " ", " ", " ", " ", " ", "w", " ", " ", " ", " ", " ", " ", " ", " ", " "],
//   [" ", " ", " ", "w", " ", " ", " ", " ", " ", "b", " ", " ", " ", " ", " ", " ", " ", " ", " "],
//   [" ", " ", " ", " ", "w", " ", " ", " ", " ", " ", " ", " ", " ", " ", "w", " ", "b", "w", " "],
//   [" ", " ", " ", " ", " ", "b", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
//   [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]
// ].map(row => row.map(col => col === " " ? "" : col))


export default function useBoard(
  mode: string,
  enemy: string,
  player: string,
  isMyTurn: boolean
) {
  const dispatch: Dispatch<any> = useDispatch();
  const setCurrentPlayer = useCallback(
    (currPlayer: string) => dispatch(updateCurrentPlayer(currPlayer)),
    [dispatch]
  );
  const setWinnerOfTheGame = useCallback(
    (w: string) => dispatch(setWinner(w)),
    [dispatch]
  );

  const updatePlayerTurn = useCallback(() => dispatch(setTurn()), [dispatch]);

  const [board, setBoard] = useState(
    Array(SIZE).fill(Array(SIZE).fill(null))
  );
  const isBlackMoving = useRef(true);
  // use ref since this doesn't need to be displayed on the UI

  // record the last time you played chess row and col
  const lastRow = useRef();
  const lastCol = useRef();

  // use here functional update because if not

  // every time board there are changes，updateBoard will change
  // so outsideChess Every flag will be all re-render
  // const updateBoard = useCallback((y, x, newValue) => {
  //   setBoard((board) => {
  //     board[y][x] = newValue;
  //     return [...board];
  //   });
  // }, []);

  const handleChessClick = useCallback(
    (row, col, value, bot = false) => {
      // already down
      if (value) return false;
      lastRow.current = row;
      lastCol.current = col;
      const currentPlayer = isBlackMoving.current ? "b" : "w"
      const isInCaptureMove = isForbiddenMove(board, row, col, currentPlayer)
      const fakeBoard = JSON.parse(JSON.stringify(board))

      fakeBoard[row][col] = currentPlayer
      let capturesBoards = findCaptures(fakeBoard, row, col)
      const isDoubleThree = capturesBoards[1] ? false : isDoubleFreeThree(board, row, col, currentPlayer)

      if (
        !isInCaptureMove &&
        !isDoubleThree
      ) {

        setBoard(capturesBoards[0])
        isBlackMoving.current = !isBlackMoving.current;
        setCurrentPlayer(isBlackMoving.current ? "Black" : "White");
        updatePlayerTurn();

        return true
      } else {
        alert(`Forbidden Move : ${isInCaptureMove ? "Cant play in capture area" : "You can perform a double three form"}`);
        return false
      }


    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [board]
  );

  useEffect(() => {
    if (lastRow.current === undefined || lastCol.current === undefined) return;
    const winner = findWinner(board, lastRow.current, lastCol.current);

    if (winner) setWinnerOfTheGame(winner);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board])

  return {
    board,
    handleChessClick,
    isBlackMoving,
  };
}

