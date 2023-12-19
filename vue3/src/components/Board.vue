

<script lang="ts">
import { type Ref } from "vue"
import * as IMG from "@/assets/images"
import { useGame, type IGameStore } from "@/store";
import { isValidMoveFor1337Mode } from "@/gomoku/modes/1337/moveValidity"
import makeMove from "@/gomoku/makeMove";
import { MoveRepport } from "@/gomoku/modes/1337/prior_moves";
import type { TPoint } from "@/gomoku/types/gomoku.type";
const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

interface IBoardData {
    images: { [key: string]: string }
    boardSize: Ref<number>
    matrix: Ref<IGameStore["matrix"]>
    turn: Ref<IGameStore["turn"]>
    winner: Ref<IGameStore["winner"]>
    goldenStones: Ref<IGameStore["goldenStones"]>
    running: Ref<IGameStore["ended"]>
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
                forbiddenMark: IMG.Forbidden
            },
            boardSize: useGame((state) => state.boardSize),
            matrix: useGame((state) => state.matrix),
            turn: useGame((state) => state.turn),
            winner: useGame((state) => state.winner),
            goldenStones: useGame((state) => state.goldenStones),
            mode: useGame((state) => state.mode),
            running: useGame((state) => !state.ended),
            blinks: useGame((state) => state.blinks),
            bestMoves: useGame((state) => state.bestMoves),
            alpha,
            isValidMoveFor1337Mode,
            mvr: new MoveRepport()
        }
    },

    watch: {
        running: function (val) {
            // console.log(this.running, val)
        },
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
                this.running &&
                e.target.getAttribute('data-is-valid-spot')
            )
                makeMove(x, y)
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
            mvr.setPoint({ x, y })
            mvr.setTurn(this.turn === "b" ? 1 : 2)
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
            return this.mvr.isNearBy(this.matrix, { x, y })
        }
    },
    created() {
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
                <!-- (turn === "b" ? 1 : 2) -->
                <template v-else-if="matrix[i - 1]?.[j - 1] !== undefined">
                    <div @click="(e: any) => makeMove(e, i - 1, j - 1)" @mouseover="() => showSates({ x: i - 1, y: j - 1 })"
                        :set="isValidSpot = mode == '1337' ? isValidMoveFor1337Mode(matrix, (turn === 'b' ? 1 : 2), i - 1, j - 1) : true"
                        :data-is-valid-spot="isValidSpot"
                        :class='"cross " + ((isGoldenStone(i - 1, j - 1) || blinks.find(l => l.x == i - 1 && l.y == j - 1)) && "blink")'>
                        <!-- <img :src='images.goldenStone' v-if="isGoldenStone(i - 1, j - 1)" class='golden-stone' /> -->

                        <img :src='images.blackStone' v-if="matrix[i - 1][j - 1] == 1" class='circle-black'>

                        <img :src='images.whiteStone' v-if="matrix[i - 1][j - 1] == 2" class='circle-white' />
                        <img :src='images.forbiddenMark' v-if="!isValidSpot" class='golden-stone' />
                        <img :src='images.checkMark' v-if="isBestMove(i - 1, j - 1)" class='circle-green' />
                        <img v-else-if="matrix[i - 1][j - 1] === 0 && isNearBy({ x: i - 1, y: j - 1 })" class='circle-black'
                            src="https://clipart-library.com/img1/1036545.png" alt="" style="width:7px;margin-bottom: 5px;">
                        <span class="tooltiptext">{{ alpha[i - 1] }}{{ j - 1 }} ({{ i - 1 }},{{ j - 1 }})</span>
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

.cross:hover {
    background-image: none;
    border-color: transparent;
    background-color: rgb(76, 95, 114);
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
</style>