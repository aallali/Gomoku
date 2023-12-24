

<script lang="ts">
import { type Ref } from "vue"
import * as IMG from "@/assets/images"
import { useGame, type IGameStore } from "@/store";
import { isValidMoveFor1337Mode } from "@/gomoku/modes/1337/moveValidity"
import { MoveRepport } from "@/gomoku/modes/1337/MoveRepport";
import type { TPoint } from "@/gomoku/types/gomoku.type";
const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

interface IBoardData {
    images: { [key: string]: string }
    boardSize: Ref<number>
    matrix: Ref<IGameStore["matrix"]>
    turn: Ref<IGameStore["turn"]>
    winner: Ref<IGameStore["winner"]>
    goldenStones: Ref<IGameStore["goldenStones"]>
    mode: Ref<IGameStore["mode"]>
    alpha: typeof alpha
    blinks: Ref<IGameStore["blinks"]>
    bestMoves: Ref<IGameStore["bestMoves"]>
    isValidSpot?: boolean
    isValidMoveFor1337Mode: typeof isValidMoveFor1337Mode
    mvr: MoveRepport
}


export default {
    data(): IBoardData {
        return {
            images: {
                x: IMG.X,
                goldenStone: IMG.GoldenStone,
                woodStone: IMG.WoodStone,
                whiteStone: IMG.WhiteStone,
                checkMark: IMG.CheckMark,
                blackStone: IMG.BlackStone,
                greenCircle: IMG.GreenCircle,
                forbiddenMark: IMG.Forbidden,
                lowCheckmark: IMG.CheckMarkLow
            },
            boardSize: useGame((state) => state.boardSize),
            matrix: useGame((state) => state.matrix),
            turn: useGame((state) => state.turn),
            winner: useGame((state) => state.winner),
            goldenStones: useGame((state) => state.goldenStones),
            mode: useGame((state) => state.mode),
            blinks: useGame((state) => state.blinks),
            bestMoves: useGame((state) => state.bestMoves),
            alpha,
            isValidMoveFor1337Mode,
            mvr: new MoveRepport()
        }
    },
    methods: {
        isBoardCorner(i: number, j: number) {
            const boardSize = this.boardSize
            return ['00', `${boardSize + 1}0`, `${boardSize + 1}${boardSize + 1}`, `0${boardSize + 1}`].includes(`${i}${j}`)
        },
        isBoardBorder(i: number, j: number) {
            return i == 0 || j == 0 || i == this.boardSize + 1 || j == this.boardSize + 1
        },
        isGameBoard(i: number, j: number) {
            return i > 0 && i <= this.boardSize
        },
        makeMove(e: any, x: number, y: number) {
            if (
                !this.blinks.length &&
                !this.matrix[x][y] &&
                !this.winner &&
                e.target.getAttribute('data-is-valid-spot')
            )
                useGame.getState().fillCell(x, y)
        },
        isGoldenStone(x: number, y: number) {
            return this.winner && this.goldenStones?.find(p => p.x == (x) && p.y == (y))
        },
        isBestMove(x: number, y: number) {
            return this.bestMoves?.find(p => p.x == (x) && p.y == (y))
        },
        showSates({ x, y }: TPoint) {
            const mvr = new MoveRepport()
            mvr.setMatrix(this.matrix)
            mvr.setTurn(this.turn)
            mvr.setPoint({ x, y })
            const analyse = mvr.repport()
            function formatAsTable(lines: string[][]): string {
                // Find the length of the longest label
                const maxLabelLength = lines.reduce((max, line) => {

                    return Math.max(max, line[0].trim().length);
                }, 0);

                const formattedLines = lines.map((line) => {
                    const [label, value] = [line[0], line[1]]
                    const paddedLabel = label.trim().padEnd(maxLabelLength + 1);
                    return `${paddedLabel}: ${value.trim()}`
                });

                return formattedLines.join('\n');
            }

            useGame.getState().setAnalyse(formatAsTable(analyse))
        },
        isNearBy({ x, y }: TPoint) {
            if (this.matrix[x][y] !== 0)
                return false
            return this.mvr.isNearBy(this.matrix, { x, y })
        }
    }
}
</script>


<template>
    <div id="board">
        <template v-for="(_, i) in new Array(boardSize + 2)" :key="i">
            <template v-for="(_, j) in new Array(boardSize + 2)" :key="j">

                <template v-if="isBoardBorder(i, j)">
                    <div v-if="i == 0 && j == 0" class="slug margin-right border-corner-left"></div>
                    <div v-else-if="j == 0 && i <= boardSize" class='slug margin-right'>{{ alpha[i - 1] }}</div>
                    <div v-else-if="i == 0 && j <= boardSize" class='slug margin-bottom'>{{ j - 1 }}</div>
                    <div v-else></div>
                </template>

                <template v-else-if="matrix[i - 1]?.[j - 1] !== undefined">
                    <div @click="(e: any) => makeMove(e, i - 1, j - 1)" @mouseover="() => showSates({ x: i - 1, y: j - 1 })"
                        :set="isValidSpot = mode == '1337' ? isValidMoveFor1337Mode(matrix, turn, i - 1, j - 1) : true"
                        :data-is-valid-spot="isValidSpot"
                        :class='((isValidSpot && !matrix[i - 1][j - 1] && "hoverable") || "") + " cross " + ((isGoldenStone(i - 1, j - 1) || blinks.find(l => l.x == i - 1 && l.y == j - 1)) && "blink")'>

                        <div v-if="matrix[i - 1][j - 1] == 1" class="piece-black-flat" />
                        <div v-if="matrix[i - 1][j - 1] == 2" class="piece-white-flat" />


                        <div v-if="!isValidSpot" class="forbidden-sign" />
                        <template v-else>
                            <img v-if="isBestMove(i - 1, j - 1)" :src='images.lowCheckmark' class='circle-green' />
                            <div v-else-if="isNearBy({ x: i - 1, y: j - 1 })" class="nearby-dot" />
                        </template>

                        <span class="tooltiptext">
                            {{ alpha[i - 1] }}{{ j - 1 }} ({{ i - 1 }},{{ j - 1 }})
                        </span>
                    </div>
                </template>
            </template>
            <br>
        </template>
    </div>
</template>

<style scoped>
.flagPro {
    border-radius: 50% !important;
    background-color: transparent !important;
    border: solid 0.5px rgba(0, 0, 0, 0) !important;
}

#board {
    width: fit-content;
    margin: 0 auto;
    font-size: 0px;
    /* background-image: url(src/assets/images/golden-stone.png); */
    background-repeat: repeat;
}

[class^="circle-"] {
    pointer-events: none;
}

.cross {
    width: 30px;
    height: 30px;
    /* background-color: rgba(230, 191, 131, 0.5); */
    margin: 1px;
    display: inline-block;
    border-radius: 8%;
    border: solid 0.5px transparent;
    background-image: url('@/assets/images/wood.jpeg');
    background-repeat: repeat;
    font-size: 30px;
    color: black;
    line-height: 30px;
    text-align: center;
    vertical-align: text-top;
    position: relative;
}

.cross .tooltiptext {
    pointer-events: none;
    visibility: hidden;
    width: 90px;
    background-color: rgb(76, 95, 114);
    color: #fff;
    border: solid 1px black;
    text-align: center;
    border-radius: 6px;
    bottom: 130%;
    /* left: 50%; */
    margin-left: -46px;
    /* Position the tooltip */
    position: absolute;
    z-index: 99;
    font-size: 16px;

}

.cross:hover .tooltiptext {
    visibility: visible;
}

.cross .tooltiptext::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 45%;

    border-width: 5px;
    border-style: solid;
    border-color: rgb(76, 95, 114) transparent transparent transparent;
}

.hoverable:hover {
    background-image: none;
    border-color: transparent;
    background-color: rgb(76, 95, 114);
}

.cross:hover> :not(.piece-black-flat):not(.piece-white-flat):not(.forbidden-sign):not(.tooltiptext) {
    display: none;
}

.slug {
    width: 30px;
    height: 30px;
    /* background-color: rgba(230, 191, 131, 0.1); */
    margin: 1px;
    display: inline-block;
    border-radius: 8%;
    border: solid 0.5px transparent;
    background-image: url('@/assets/images/wood.jpeg');
    font-size: 16px;
    font-weight: lighter;
    color: black;
    line-height: 30px;
    text-align: center;
    vertical-align: text-top;
}

.blink {
    -webkit-animation: blinkingBackground 1s infinite;
    /* Safari 4+ */
    -moz-animation: blinkingBackground 1s infinite;
    /* Fx 5+ */
    -o-animation: blinkingBackground 1s infinite;
    /* Opera 12+ */
    animation: blinkingBackground 0.3s infinite;
    /* IE 10+, Fx 29+ */
}

@keyframes blinkingBackground {

    100% {
        background-image: none;
        background-color: rgb(216, 216, 29);
    }
}

.border-corner-left {
    border-top-left-radius: 50px;
}

.border-transparent {
    border-color: transparent;
    background-color: transparent;
    background-image: none
}

.margin-right {
    margin-right: 4px
}

.margin-bottom {
    margin-bottom: 4px;
}



.piece-black-flat,
.piece-white-flat {
    position: relative;
    border-radius: 50%;
    width: 90%;
    height: 90%;
    margin: auto;
}

.piece-black-flat::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: inherit;
    background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%);
}

.piece-black-flat {
    margin-top: 1px;
    margin-left: 1px;
    background-color: black;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

.piece-white-flat {
    background-color: white;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    border: 0px solid #000000;
}

.nearby-dot {
    position: relative;
    border-radius: 50%;
    width: 15%;
    height: 15%;
    margin: auto;
    background-color: green;
    top: 50%;
    transform: translateY(-50%);
}


.forbidden-sign {
    position: relative;
    height: 100%;
    height: 100%;
}

.forbidden-sign::before,
.forbidden-sign::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 3px;
    background-color: red;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.forbidden-sign::before {
    transform: translate(-50%, -50%) rotate(45deg);
}

.forbidden-sign::after {
    transform: translate(-50%, -50%) rotate(-45deg);
}
</style>