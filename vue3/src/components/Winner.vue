<script lang="ts" setup>
import { useGame } from '@/store';

const winner = useGame((state) => state.winner)
const winnerDic = {
    "T": "Tie",
    1: "Black",
    2: "White"
}

</script>
<template>
    <fieldset v-if="winner">
        <label>Winner: <b>{{ winnerDic[winner] }}</b></label>
    </fieldset>
</template>
