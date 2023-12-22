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
            moves: moves,
            movesInput: ""
        }
    },
    methods: {
        async copyToClipboard(txt2Cpy: string) {
            try {
                await navigator.clipboard.writeText(txt2Cpy);
                alert('Text successfully copied to clipboard');
            } catch (error: any) {

                console.error('Unable to copy text to clipboard', error);
                alert('Unable to copy text to clipboard: ' + error.message)
            }
        },
        importFromInput() {
            useGame((state) => state.importMove)(this.movesInput)
        }
    }
}

</script>
<template>
    <div class="moves_container">
        <table>
            <thead>
                <tr>
                    <th style="border: none;"></th>
                    <th style="border: none;"></th>
                    <td v-for="(_move, idx) in moves?.filter((_l, i) => i % 2 == 0)" :key="idx">{{ idx + 1 }}</td>
                </tr>
                <tr>
                    <th rowspan="2" style="border: none;"><button class="btn-copy"
                            @click="copyToClipboard(moves.join(','))">Copy</button></th>
                    <th style=""> <img :src='IMG_BlackStone' class='circle-black' style="width: 20px;"></th>
                    <td v-for="move in moves?.filter((_l, i) => i % 2 == 0)" :key="move">{{ move }}</td>
                </tr>

                <tr>
                    <th style=""><img :src='IMG_WhiteStone' class='circle-white' style="width: 20px;"></th>
                    <td v-for="move in moves?.filter((_l, i) => i % 2 != 0)" :key="move">{{ move }}</td>
                </tr>
                <tr>
                    <th rowspan="2" style="border: none;"><button @click="importFromInput()">Import</button>
                    </th>
                    <td :colspan="(moves?.length || 0) + 1" style="padding:1px;">
                        <input type="text" v-model="movesInput">
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
    background-image: url(@/assets/images/wood.jpeg);
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
    /* width: 30px; */
    text-align: center;
    font-weight: bold;
    min-width: 50px;

}

th {
    text-align: center;
}
</style>