

let MATRIX = [];

const MOVES = {
    history: [],
    suggested: []
}
let GAME = {
    Size: 19,
    Mode: "1337",
    Black: {
        type: "human",
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
    MOVES.history = []

    let moves = $("#moves_bar").val().split(",").map(l => l.trim()).filter(l => /[A-Z]{1}[0-9]{1,2}/.test(l))
    ResetStates()
    InitBoard()
    // UpdateBoard();
    // ShowMovesHistory()
    $(`#black_${GAME.Black.type}`).prop('checked', true);
    $(`#white_${GAME.White.type}`).prop('checked', true);
    $(`#mode_${GAME.Mode}`).prop('checked', true);
    GAME.Turn = "Black";
    GAME.Ended = false;

    if (!moves.length && GAME[GAME.Turn].type == "ai") {
        const half = parseInt(GAME.Size / 2)
        moves = [`${alpha[half]}${half}`]
        const randomSpots = [
            // 'I8', // T
            // 'I9', // T
            // 'I10', // T
            // 'J10', // T
            'K10', // 'win'
            'K9', // W
            // 'K8', // T
            // 'J8', // T
            'J9', // T
            // 'H7', // L
            // 'H8', // L
            'H9', // w
            'H10', // W
            // 'H11', // L
            // 'I11', // T
            // 'J11',  // L
            // 'K11', // T
            // 'L11', // 'lose'
            // 'L10', // L
            // 'L9', // L
            'L8', // W
            // 'L7', // 'L'
            // 'K7', // L
            // 'J7', // T
            // 'I7', // L
        ];

        const random = Math.floor(Math.random() * randomSpots.length);
        moves = [randomSpots[random]]
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
        UpdateBoard();
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
    let moves = $("#moves_bar").val().split(",").map(l => l.trim()).filter(l => /[A-Z]{1}[0-9]{1,2}/.test(l)).reverse()
    MATRIX = ApplyMoves(moves).board
    UpdateBoard();
}

WelcomeBoard()
/*

J9
I10
I8
K10
H7
J10
H10
K9
I11
L8
K11
G6
J11
H11
G12
H11

*/