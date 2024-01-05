<template>
    <fieldset>
        <h4 style="margin: 0px">Ai Analyse:</h4>
        <br/>
        <div style="display: flex;flex-direction: column;">
        <textarea cols="35" rows="22" style="font-size: 15px" v-bind:value="analyse"></textarea>

        </div>
    </fieldset>
</template>

<script lang="ts" setup>

import { useGame } from '@/store';
const analyse = useGame((state) => state.analyse)

</script>
