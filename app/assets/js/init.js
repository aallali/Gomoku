

let MATRIX = [];

const MOVES = {
    history: [],
    suggested: []
}
let GAME = {
    Size: 19,
    Mode: "1337",
    Black: {
        type: "ai",
        captures: 0,
        score: 0
    },
    White: {
        type: "human",
        captures: 0,
        score: 0
    },
    Ended: true,
    Winner: false, // black | white
    Turn: "Black"
}
let GameBackUp = { ...GAME }
const alpha = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase()
$(`#black_${GAME.Black.type}`).prop('checked', true);
$(`#white_${GAME.White.type}`).prop('checked', true);
$(`#mode_${GAME.Mode}`).prop('checked', true);

function StartGame() {


    let moves = $("#moves_history").val().split("\n").map(l => l.trim()).filter(l => /[A-Z]{1}[0-9]{1,2}/.test(l))

    ResetStates()
    InitBoard()
    // RenderBoard();
    // ShowMovesHistory()
    $(`#black_${GAME.Black.type}`).prop('checked', true);
    $(`#white_${GAME.White.type}`).prop('checked', true);
    $(`#mode_${GAME.Mode}`).prop('checked', true);
    GAME.Turn = "Black"
    GAME.Ended = false

    if (!moves.length && GAME[GAME.Turn].type == "ai") {
        const half = parseInt(GAME.Size / 2)
        moves = [`${alpha[half]}${half}`]
    }

    if (moves.length) {
        const { board: matrix, captures, turn } = ApplyMoves(moves)
        console.log({ matrix, captures, turn })
        MATRIX = matrix
        GAME.Turn = turn
        GAME.Black.captures += captures.Black
        GAME.White.captures += captures.White

        MOVES.history = moves
        RenderInfos()
        ShowMovesHistory();
        RenderBoard();
        ShowValidSpots();

        const aiMove = AI()
        if (GAME[GAME.Turn].type == "ai") {
            console.log("yooo")
            PutStone(aiMove.x, aiMove.y, true)
        }
    }
}

function WelcomeBoard() {
    InitBoard()
    let moves = $("#moves_history").val().split("\n").map(l => l.trim()).filter(l => /[A-Z]{1}[0-9]{1,2}/.test(l))
    console.log(moves)
    MATRIX = ApplyMoves(moves).board
    RenderBoard();
}

WelcomeBoard()