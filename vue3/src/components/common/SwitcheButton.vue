<template>
    <div>
        <input class="tgl tgl-flip" :id="id" type="checkbox" :value="$props.selected"
            :checked="$props.selected === $props.options[1]" v-on:change="changeHandler">
        <label class="tgl-btn" :data-tg-off="$props.options[0]" :data-tg-on="$props.options[1]" :for="id"></label>
    </div>
</template>
<script lang="ts">

export default {
    props: {
        options: {
            type: Array,
            required: true
        },
        selected: {
            type: String,
            required: true
        },
        onChangeHandler: {
            type: Function,
            required: true
        }
    },
    data() {
        return {
            id: ''
        }
    },
    mounted() {
        this.id = Date.now().toString(36) + Math.random().toString(36).replace(/\./, '')
    },
    methods: {
        changeHandler: function (event: Event) {
            this.$props.onChangeHandler(event)
        }
    },

}
</script>
<style scoped>
.tgl {
    display: none;
}

.tgl,
.tgl:after,
.tgl:before,
.tgl *,
.tgl *:after,
.tgl *:before,
.tgl+.tgl-btn {
    box-sizing: border-box;
}

.tgl::-moz-selection,
.tgl:after::-moz-selection,
.tgl:before::-moz-selection,
.tgl *::-moz-selection,
.tgl *:after::-moz-selection,
.tgl *:before::-moz-selection,
.tgl+.tgl-btn::-moz-selection {
    background: none;
}

.tgl::selection,
.tgl:after::selection,
.tgl:before::selection,
.tgl *::selection,
.tgl *:after::selection,
.tgl *:before::selection,
.tgl+.tgl-btn::selection {
    background: none;
}

.tgl+.tgl-btn {
    outline: 0;
    display: block;
    /* width: 4em; */
    height: 2em;
    position: relative;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

.tgl+.tgl-btn:after,
.tgl+.tgl-btn:before {
    position: relative;
    display: block;
    content: "";
    width: 50%;
    height: 100%;
}

.tgl+.tgl-btn:after {
    left: 0;
}

.tgl+.tgl-btn:before {
    display: none;
}

.tgl:checked+.tgl-btn:after {
    left: 50%;
}


.tgl-flat+.tgl-btn {
    padding: 2px;
    transition: all 0.2s ease;
    background: #fff;
    border: 4px solid #f2f2f2;
    border-radius: 2em;
}

.tgl-flat+.tgl-btn:after {
    transition: all 0.2s ease;
    background: #f2f2f2;
    content: "";
    border-radius: 1em;
}

.tgl-flat:checked+.tgl-btn {
    border: 4px solid #7FC6A6;
}

.tgl-flat:checked+.tgl-btn:after {
    left: 50%;
    background: #a68907;
}

.tgl-flip+.tgl-btn {
    padding: 2px;
    transition: all 0.2s ease;
    font-family: sans-serif;
    perspective: 100px;
}

.tgl-flip+.tgl-btn:after,
.tgl-flip+.tgl-btn:before {
    display: inline-block;
    transition: all 0.4s ease;
    width: 100%;
    text-align: center;
    position: absolute;
    line-height: 2em;
    font-weight: bold;
    color: #fff;
    position: absolute;
    top: 0;
    left: 0;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    border-radius: 4px;
}

.tgl-flip+.tgl-btn:after {
    content: attr(data-tg-on);
    background: #a68907;

    transform: rotateY(-180deg);
}

.tgl-flip+.tgl-btn:before {
    background: #0534a3;
    content: attr(data-tg-off);
}

.tgl-flip+.tgl-btn:active:before {
    transform: rotateY(-20deg);
}

.tgl-flip:checked+.tgl-btn:before {
    transform: rotateY(180deg);
}

.tgl-flip:checked+.tgl-btn:after {
    transform: rotateY(0);
    left: 0;
    background: #a68907;
}

.tgl-flip:checked+.tgl-btn:active:after {
    transform: rotateY(20deg);
}
</style>