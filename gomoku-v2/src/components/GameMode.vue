<template>
    <fieldset>
        <h4 style="margin: 0px">Game Mode</h4>
        <SwitcheButton v-bind:options="['Normal', 'Captures']" :selected="mode === 'normal' ? 'Normal' : 'Captures'"
            :onChangeHandler="handleModeChange" />
    </fieldset>

    <fieldset>
        <div class="thinkingTime">
            <h4 class="option-title">Thinking time (seconds):</h4>
            <br />
            <template v-for="(t,i) in [0.5, 1, 1.5, 2, 2.5, 3]"  :key="i">
                <button  :class="selectedThinkingTime === t ? 'selected' : ''"
                @click="selectedThinkingTime = t">{{ t }}</button>
                <br v-if="i === 2"/>
            </template>
        </div>
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
            selectedThinkingTime: 1
        }
    },
    watch: {
        selectedThinkingTime: (ss) => {
            useGame((state) => state.setThinkTime)(ss)
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

<style scoped>
.thinkingTime button {
    padding: 8px;
    min-width: 55px;
    font-size: 20px;
    background-color: rgb(97, 97, 97);
    color: white;
    margin: 3px;
 
}

.thinkingTime button.selected {
    background-color: rgb(70, 70, 70)
}
</style>
