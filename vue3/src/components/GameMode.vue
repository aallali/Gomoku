<script lang="ts">
import { useGame, type IGameStore } from "../store";

const { boardSize, setBoardSize, setGameMode, mode } = useGame.getState()
export default {
    data() {
        return {
            boardSize,
            setBoardSize,
            mode
        }
    },
    methods: {
        handleModeChange(event: Event) {
            const target = event.target as HTMLInputElement
            setGameMode(target.value as IGameStore["mode"])
        }
    },
}
</script>
<template>
    <fieldset>
        <h4 style="margin: 0px">Game Mode:</h4>

        <input type="radio" name="game_mode" value="1337" v-on:change="handleModeChange" :checked="mode === '1337'">
        <label for="mode_1337">1337</label>
        <br />

        <input type="radio" name="game_mode" value="normal" v-on:change="handleModeChange" :checked="mode === 'normal'" />
        <label for="mode_normal">Normal (5 in row)</label>
        <br />


    </fieldset>

    <fieldset>
        <h4 style="margin: 0px">Board Size:</h4>
        <input type="number" :value="boardSize" class="boardSize" :min="3" :max="19"
            @change="(event: any) => setBoardSize(parseInt(event.target.value as string))" />
    </fieldset>
</template>
 