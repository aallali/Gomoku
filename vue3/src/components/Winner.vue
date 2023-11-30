<script lang="ts">
import { useGame } from '@/store';

export default {
    data() {
        return {
            winner: useGame((state) => state.winner),
        }
    },
}
</script>
<template>
    <!-- <h3 style="color: transparent">_</h3> -->
    <fieldset v-if="winner">
        <label>Winner: <b>{{ winner == "b" ? "Black" : "White" }}</b></label>
    </fieldset>
</template>