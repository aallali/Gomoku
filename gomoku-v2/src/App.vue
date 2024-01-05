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
import { useGame } from "./store";

const undo = useGame((state) => state.undoMove)
const moves = useGame((state) => state.moves)
const is1337Mode = useGame((state) => state.mode === "1337")

// inline component with JSX
// 'Droid Sans Mono', 'monospace', monospace
const UndoMoveButton = defineComponent({
  props: {
    label: String
  },
  render() {
    return (
      <fieldset>
        <button class="undoMoveBtn" onClick={undo}>undo</button>
      </fieldset>
    )
  }
})

export default {
  data(): any {
    return {
      moves,
      is1337Mode
    }
  },
  components: {
    Grid,
    UndoMoveButton,
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
    <div class="title">Gomoku v2.0</div>
    <div class="line" />
  </div>

  <div class="grid-container">
    <!-- Board  -->
    <Grid>
      <Board />
    </Grid>

    <!-- Game settings -->
    <Grid>
      <Stats />
      <Winner />
      <AiAnalayse v-if="is1337Mode"/>
    </Grid>

    <!-- Ai analyse board -->
    <Grid>
      <Players />
      <GameMode v-if="!moves.length" />
      <UndoMoveButton v-if="is1337Mode && moves.length" />
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