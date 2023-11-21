

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


/**
 * - load moves from #moves_bar input and apply them to MATRIX
 * - add a random first move if the moves list empty and the Black in type AI
 */
function StartGame() {
    MOVES.history = []

    let moves = $("#moves_bar").val().split(",").map(l => l.trim()).filter(l => /[A-Z]{1}[0-9]{1,2}/.test(l))
    ResetStates()
    InitBoard()
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

        const aiMove = AI(GAME.Turn == "Black" ? 1 : 2)
        if (GAME[GAME.Turn].type == "ai") {
            PutStone(aiMove.x, aiMove.y, true)
        }
    }
}

/**
 * animate the welcome message in board on first page load
 */
function WelcomeBoard() {
    InitBoard()
    let moves = $("#moves_bar").val().split(",").map(l => l.trim()).filter(l => /[A-Z]{1}[0-9]{1,2}/.test(l))

    for (let i = 0; i < moves.length; i++) {
        const { x, y } = ConvertMoveFormat(moves[i])

        MATRIX[x][y] = 2
    }

    UpdateBoard();
}


$(`#black_${GAME.Black.type}`).prop('checked', true);
$(`#white_${GAME.White.type}`).prop('checked', true);
$(`#mode_${GAME.Mode}`).prop('checked', true);

$('#moves_bar').val("P0, Q1, R2, S3, A3, B2, C1, D0, A15, B16, C17, D18, S15, R16, Q17, P18, M16, L16, K16, J16, I16, H16, G16, G15, G14, J11, J10, M10, M11, M12, L12, K12, J12, I12, H12, G12, G11, G10, J6, J7, G6, G7, G8, H8, I8, J8, K8, L8, H14, M8, M7, M6, M4, L4, K4, J4, I4, H4, G4, H3, I2, K8, J8")
$('#moves_suggestions').val('Start a game first ...')

WelcomeBoard()
