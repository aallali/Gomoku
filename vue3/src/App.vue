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
  <div class="container">
    <div class="grid-container" >
      <Grid>
        <Board />
      </Grid>

      <Grid>
        <AiAnalayse />
      </Grid>
    </div>

  </div>
  <History />

  <div class="container">

    <div class="grid-container">

      <Grid>
        <Winner />
        <Players />
        <GameMode />
      </Grid>

      <Grid>
        <Stats />
        <StartButton />
      </Grid>



    </div>

  </div>
</template>
