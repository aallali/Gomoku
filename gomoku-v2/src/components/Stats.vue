<script lang="ts" setup>
import { useGame } from '@/store';
const moves = useGame((state) => state.moves)
const turn = useGame((state) => state.turn)
const currentPlayer = useGame((state) => state.players[turn.value])

const captures = useGame((state) => [state.players[1].captures, state.players[2].captures])
const timeCost = useGame((state) => state.timeCost)

</script>
<template>
    <fieldset>
        <ul style="padding-left: 22px;margin-top: 0px;">
            <li>Total Moves: <b>{{ moves.length }}</b></li>
            <hr />

            <li>Black Captures: <b>{{ captures[0] }}</b></li>
            <li>White Captures: <b>{{ captures[1] }}</b></li>

            <hr />

            <li>Ai thinking time: <b>&lt;{{ timeCost }}&gt;</b> seconds</li>
            <hr />

            <li>Now Playing: [<b style="text-transform: uppercase;">{{ turn == 1 ? "Black" : "White" }}</b>]</li>
        </ul>
    </fieldset>
</template>
