<template>
    <fieldset>
        <div>
            <h4 class="option-title">Black is:</h4>
            <SwitcheButton v-bind:options="['Ai', 'Human']" :selected="players.black === 'ai' ? 'Ai' : 'Human'"
                :onChangeHandler="(event: Event) => handleChange('b', event)" />
        </div>
        <hr>
        <div>
            <h4 class="option-title">White is:</h4>
            <SwitcheButton v-bind:options="['Ai', 'Human']" :selected="players.white === 'ai' ? 'Ai' : 'Human'"
                :onChangeHandler="(event: Event) => handleChange('w', event)" />
        </div>
    </fieldset>
</template>

<script lang="ts">
import SwitcheButton from "./common/SwitcheButton.vue";
import { useGame } from '@/store';

const updatePlayerType = useGame((state) => state.setPlayerType)

export default {
    components: {
        SwitcheButton
    },
    data() {
        return {
            players: {
                black: useGame((state) => state.players.black.type),
                white: useGame((state) => state.players.white.type),
            }
        }
    },
    methods: {
        handleChange(player: "b" | "w", e: Event) {
            const trg = e.target as HTMLInputElement
            const playerType = trg.value as 'Ai' | 'Human'
            updatePlayerType(player, /ai/.test(playerType) ? "ai" : "h")
        }
    },
}
</script>

<style scoped>
.option-title {
    margin-bottom: 6px;
}
</style>
