<template>
    <fieldset>
        <h4 style="margin: 0px">Ai Analyse:</h4>
        <textarea cols="35" rows="35" style="font-size: 15px" v-bind:value="analyse"></textarea>
    </fieldset>
</template>

<script lang="ts" setup>

import { useGame } from '@/store';
const analyse = useGame((state) => state.analyse)

</script>
