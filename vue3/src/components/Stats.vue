<script lang="ts">
import { useGame } from '@/store';
const players = useGame((state) => state.players)
const moves = useGame((state) => state.moves)
const turn = useGame((state) => state.turn)
const captures = useGame((state) => [state.players.black.captures, state.players.white.captures])
export default {
    data() {
        return {
            players,
            moves,
            turn,
            captures
        }
    }
}
</script>
<template>
    <fieldset>
        <ul style="padding-left: 22px;margin-top: 0px;">
            <li>Total Moves: <b>{{ moves.length }}</b></li>
            <hr />
            

            <li>Black Captures: <b>{{ captures[0] }}</b></li>
            <li>White Captures: <b>{{ captures[1] }}</b></li>
            <br>

            <li>Black Score: <b>{{ players.black.score }}</b></li>
            <li>White Score: <b>{{ players.white.score }}</b></li>

            <hr />
    

            <li>Now Playing: [<b style="text-transform: uppercase;">{{ turn == "b" ? "Black" : "White" }}</b>]</li>

        </ul>
        <!-- <button style="width: 100%;padding: 5px;font-size:18px;border: none;border-radius:4px">clear moves</button> -->
    </fieldset>
</template>