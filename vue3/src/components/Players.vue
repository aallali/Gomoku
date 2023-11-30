<script lang="ts">
import { useGame } from '@/store';
const updatePlayerType = useGame((state) => state.setPlayerType)
export default {
    data() {
        return {
            players: {
                black: useGame((state) => state.players.black.type),
                white: useGame((state) => state.players.white.type),
            }
        }
    },
    methods: {
        handleChange(e: Event) {
            const trg = e.target as HTMLInputElement
            updatePlayerType(trg.getAttribute('name') as "b" | "w", trg.value as "h" | "ai")
        }
    },
}
</script>
<template>
    <fieldset>
        <h4 style="margin: 0px">Players: </h4>
        <br>
        <div>
            <h5 class="option-title">Black is: {{ players.black }}</h5>
            <input type="radio" name="b" value="ai" :checked="players.black === 'ai'" v-on:change="handleChange" />
            <label for="black_ai">Ai</label><br />
            <input type="radio" name="b" value="human" :checked="players.black === 'h'" v-on:change="handleChange" />
            <label for="black_human">Human</label><br />
        </div>
        <br>

        <div style="color: white">
            <h5 class="option-title">White is: {{ players.white }}</h5>
            <input type="radio" name="w" value="ai" :checked="players.white === 'ai'" v-on:change="handleChange" />
            <label for="white_ai">Ai</label><br />
            <input type="radio" name="w" value="human" :checked="players.white === 'h'" v-on:change="handleChange" />
            <label for="white_human">Human</label><br />
        </div>
    </fieldset>
</template>