<template>
    <fieldset>
        <h4 style="margin: 0px">Game Mode</h4>
        <SwitcheButton v-bind:options="['Normal', 'Captures']" :selected="mode === 'normal' ? 'Normal' : 'Captures'"
            :onChangeHandler="handleModeChange" />
    </fieldset>

    <fieldset>
        <h4 style="margin: 0px">Board Size:</h4>
        <input type="number" :value="boardSize" class="boardSize" :min="3" :max="19" @change="handleBoardSizeChange" />
    </fieldset>
</template>

<script lang="ts">
import { useGame, type IGameStore } from "../store";
import SwitcheButton from "./common/SwitcheButton.vue";

const { setGameMode, setBoardSize } = useGame.getState()

export default {
    components: {
        SwitcheButton
    },
    data() {
        return {
            boardSize: useGame((state) => state.boardSize),
            mode: useGame((state) => state.mode),
        }
    },
    methods: {
        handleModeChange() {
            setGameMode(this.mode === "1337" ? "normal" : "1337" as IGameStore["mode"])
        },
        handleBoardSizeChange(event: Event) {
            const target = event.target as HTMLInputElement
            setBoardSize(parseInt(target.value as string))
        }
    },
}
</script>
