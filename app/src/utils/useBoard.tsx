import { useState, useRef, useCallback, useEffect } from "react";
import { findWinner } from "./util";

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
    [" ", " ", " ", " ", " ", " ", " ", "b", "b", "b", "b", " ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "w", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "w", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "b", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]
].map(row => row.map(col => col.trim()))

export default function useBoard() {
    const [board, setBoard] = useState(demoBoard || Array(SIZE).fill(Array(SIZE).fill(null)));
    const [wineer, setWineer] = useState<string|undefined>();

    // use ref since this doesn't need to be displayed on the UI

    const isBlackMoving = useRef(true);

    // record the last time you played chess row and col
    const lastRow = useRef();
    const lastCol = useRef();

    // use here functional update because if not

    // every time board there are changes，updateBoard will change
    // so outsideChess Every flag will be all re-render
    const updateBoard = useCallback((y, x, newValue) => {
        setBoard((board) =>
            board.map((row, currentY) => {

                // If this horizontal row is not what I want to change, just return it directly
                if (currentY !== y) return row;


                // If yes, find the position of the x I want to change
                return row.map((col: any, currentX: any) => {
                    if (currentX !== x) return col;
                    return newValue;
                });
            })
        );
    }, []);

    const handleChessClick = useCallback(
        (row, col, value) => {

            // already down
            if (value) return;

            lastRow.current = row;
            lastCol.current = col;
            updateBoard(row, col, isBlackMoving.current ? "b" : "w");
            isBlackMoving.current = !isBlackMoving.current;
        },
        [updateBoard]
    );

    useEffect(() => {
        if (!lastRow.current || !lastCol.current) return
        setWineer(findWinner(board, lastRow.current, lastCol.current));
    }, [board]);

    return {
        board,
        wineer,

        handleChessClick
    };
}
