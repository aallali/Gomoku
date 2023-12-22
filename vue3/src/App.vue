<script lang="tsx">
import { defineComponent } from "vue";
import Grid from "./components/common/Grid.vue"
import Board from "./components/Board.vue"
import History from "./components/History.vue"
import GameMode from "./components/GameMode.vue"
import AiAnalayse from "./components/AiAnalayse.vue"
import Players from "./components/Players.vue"
import Stats from "./components/Stats.vue"
import Winner from "./components/Winner.vue"
// inline component with JSX
// 'Droid Sans Mono', 'monospace', monospace
const StartButton = defineComponent({
  props: {
    label: String
  },
  render() {
    return (
      <fieldset>
        <button class="startBtn">Start</button>
      </fieldset>
    )
  }
})

export default {
  data(): any {
    return {}
  },
  components: {
    Grid,
    StartButton,
    Board,
    GameMode,
    AiAnalayse,
    History,
    Players,
    Stats,
    Winner,
  }
}
</script>

<template>
  <div class="title-container">
    <div class="line" />
    <div class="title">Gomoku </div>
    <div class="line" />
  </div>


  <div class="grid-container">

    <!-- Board  -->
    <Grid>
      <Board />
    </Grid>
    <!-- Ai analyse board -->
    <Grid>
      <AiAnalayse />
    </Grid>

    <!-- Game settings -->
    <Grid>
      <Winner />
      <Players />
      <GameMode />
    </Grid>

    <!-- Players Stats -->
    <Grid>
      <Stats />
      <StartButton />
    </Grid>

  </div>

  <!-- Moves history during game -->
  <History />
  <div class="title-container">
    <div class="line"></div>
  </div>
</template>

<style scoped>
.title-container {
  display: flex;
  align-items: center;
  flex: 1;
  margin-top: 30px;
  margin-bottom: 30px;

}

.line {
  flex: 1;
  height: 3px;
  background-color: black;
  border-bottom: solid 1px wheat;
  margin: 0 10px;
}

.title {
  font-size: 30px;
  color: wheat;
  white-space: nowrap;
  padding: 0 16px;
  /* Adjust the padding as needed */
}
</style>