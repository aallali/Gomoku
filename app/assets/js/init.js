

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


function StartGame() {
    ResetStates()
    InitBoard()
    update();
    $(`#black_${GAME.Black.type}`).prop('checked', true);
    $(`#white_${GAME.White.type}`).prop('checked', true);
    $(`#mode_${GAME.Mode}`).prop('checked', true);
    GAME.Turn = "Black"
   
    GAME.Ended = false
    if (GAME.Black.type === "ai") {
        PutStone(9,9 ,true);
    }
    let stop =false
    // const moves = `J9
    // `.split("\n").forEach((dm) => {
    //     if (dm) {
    //         dm.trim().split("-").forEach((m) => {
    //             if (m) {
    //                 // console.log(m)
    //                 if (!stop) {
    //                     if (PutStone(alpha.indexOf(m[0]), parseInt(m[1] + (m[2] || '')), false) == 1872)
    //                         stop = true
    //                 }
                    
    //             }
               
    //         })
    //     }

    // })
    // AI()

}
// G11-I11
// J7-G9
// G12-H9
// G8

// InitBoard()
// update();

StartGame()
// PutStone(9, 9)