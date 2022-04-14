import { useState, useRef, useCallback, useEffect } from "react";
import { findWinner, findCaptures, isForbiddenMove, isDoubleFreeThree } from "./util";
import { updateCurrentPlayer, setTurn } from "../store/actionCreators"
import { Dispatch } from "redux"
import { shallowEqual, useDispatch, useSelector } from "react-redux"
const SIZE = 19;

const { log } = console
let demoBoard = [
	[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
	[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
	[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
	[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
	[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
	[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
	[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
	[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
	[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
	[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
	[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
	[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
	[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
	[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
	[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
	[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
	[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
	[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
	[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]
].map(row => row.map(col => col.trim()))

export default function useBoard(mode: string, enemy: string, player: string, isMyTurn:boolean) {

	const dispatch: Dispatch<any> = useDispatch()
	const setCurrentPlayer = useCallback(
		(currPlayer: string) => dispatch(updateCurrentPlayer(currPlayer)),
		[dispatch]
	)
	const updatePlayerTurn = useCallback(() => dispatch(setTurn()), [dispatch])

	const [board, setBoard] = useState(demoBoard || Array(SIZE).fill(Array(SIZE).fill(null)));
	const [wineer, setWineer] = useState<string | undefined>();
	const isBlackMoving = useRef(true);
	// use ref since this doesn't need to be displayed on the UI


	// record the last time you played chess row and col
	const lastRow = useRef();
	const lastCol = useRef();

	// use here functional update because if not

	// every time board there are changes，updateBoard will change
	// so outsideChess Every flag will be all re-render
	const updateBoard = useCallback((y, x, newValue) => {
		setBoard((board) => {
			board[y][x] = newValue
			return [...board]
		});
	}, []);


	const handleChessClick = useCallback(
		(row, col, value) => {
			// already down
			if (value) return;
			lastRow.current = row;
			lastCol.current = col;

			// if (!isForbiddenMove(board, row, col, isBlackMoving.current ? "b" : "w") && !isDoubleFreeThree(board, row, col, isBlackMoving.current ? "b" : "w")) {

				updateBoard(row, col, isBlackMoving.current ? "b" : "w");
				isBlackMoving.current = !isBlackMoving.current;
				setCurrentPlayer(isBlackMoving.current ? "b" : "w")
				updatePlayerTurn()

			// } else
			// 	alert("Forbidden Move")
		},
		[updateBoard, board]
	);

	useEffect(() => {

		if (!lastRow.current || !lastCol.current) return
		setBoard(findCaptures(board, lastRow.current, lastCol.current))
		const winner = findWinner(board, lastRow.current, lastCol.current)
		// if (winner)
		// 	setWineer(winner);

	}, [board]);



	return {
		board,
		wineer,
		handleChessClick
	};
}

