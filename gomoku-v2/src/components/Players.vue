<template>
    <fieldset style="min-width: 120px;">
        <div>
            <h4 class="option-title">Black is:</h4>
            <SwitcheButton v-bind:options="['ai', 'human']" :selected="players.black === 'ai' ? 'ai' : 'human'"
                :onChangeHandler="(event: Event) => handleChange(1, event)" />
        </div>
        <hr>
        <div>
            <h4 class="option-title">White is:</h4>
            <SwitcheButton v-bind:options="['ai', 'human']" :selected="players.white === 'ai' ? 'ai' : 'human'"
                :onChangeHandler="(event: Event) => handleChange(2, event)" />
        </div>
    </fieldset>
</template>

<script lang="ts">
import type { P } from "@/gomoku/types/gomoku.type";
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
                black: useGame((state) => state.players[1].type),
                white: useGame((state) => state.players[2].type),
            }
        }
    },
    methods: {
        handleChange(player: P, e: Event) {
            const trg = e.target as HTMLInputElement
            const playerType = trg.value as 'ai' | 'human'
            updatePlayerType(player, /ai/i.test(playerType) ? "h" : "ai")
        }
    },
}
</script>

<style scoped>
.option-title {
    margin-bottom: 6px;
}
</style>
