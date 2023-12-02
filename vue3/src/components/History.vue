<script lang="ts">
import IMG_BlackStone from "@/assets/images/black-stone2.png"
import IMG_WhiteStone from "@/assets/images/white-stone.webp"
import { useGame } from "@/store"
const moves = useGame((state) => state.moves)

export default {
    data() {
        return {
            IMG_BlackStone,
            IMG_WhiteStone,
            moves: moves
        }
    },
    created() {
        // this.moves = this.movesRaw.match(/([A-S][0-9]{1,2})/g) || []
    },
}
</script>
<template>
    <div class="moves_container" v-if="moves.length">
        <table>
            <thead>
                <tr>
                    <th style="border: none;"></th>
                    <th style="border: none;"></th>
                    <td v-for="(_move, idx) in moves?.filter((_l, i) => i % 2 == 0)" :key="idx">{{ idx + 1 }}</td>
                </tr>
                <tr>
                    <th rowspan="2" style="border: none;"><button class="btn-copy">Copy</button></th>
                    <th style=""> <img :src='IMG_BlackStone' class='circle-black'></th>
                    <td v-for="move in moves?.filter((_l, i) => i % 2 == 0)" :key="move">{{ move }}</td>
                </tr>

                <tr>
                    <th style=""><img :src='IMG_WhiteStone' class='circle-white'></th>
                    <td v-for="move in moves?.filter((_l, i) => i % 2 != 0)" :key="move">{{ move }}</td>
                </tr>
                <tr>
                    <th rowspan="2" style="border: none;"><button>Import</button></th>
                    <td :colspan="(moves?.length || 0) + 1" style="padding:1px;">
                        <input type="text">
                    </td>
                </tr>

            </thead>
        </table>
    </div>
</template>


<style scoped>
.moves_container {
    font-size: 17px;
    margin: 50px;
    background-image: url(src/assets/images/wood.jpeg);
    background-repeat: repeat;
    padding: 5px;
    border-radius: 5px;
    overflow: hidden;
    overflow-x: auto;
    /* position: absolute; */
}

input {
    width: 100%;
    height: 30px;
    border: none;
    box-sizing: border-box;
}

button {
    width: 100%;
    height: 30px;
    /* border: none; */
    border: dotted 1px black;
    border-radius: 6px;
    font-weight: bold;
    color: rgb(49, 49, 49);
}

button:hover {
    color: white;
    background-color: #037ce6;
}

.btn-copy {
    height: 70px;
}

table,
th,
td {
    border: 1px solid rgb(76, 95, 114);
    /* border-collapse: collapse; */
    border-radius: 3px;
}

td {
    width: 35px;
    text-align: center;
    font-weight: bold;
    min-width: 50px;

}

th {
    min-width: 50px;
    text-align: center;
}

</style>