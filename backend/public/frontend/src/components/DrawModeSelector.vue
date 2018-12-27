<template>
    <div>
        <b-input-group size="sm">
            <b-form-select v-model="selected" :options="options" class="mode-select">

            </b-form-select>
            <b-button slot="append" @click="toggleDrawing" :pressed="drawing" variant="my-primary">
                Draw
            </b-button>

        </b-input-group>
    </div>
</template>

<script>
    import EventBus from "@/EventBus";
    export default {
        name: "DrawModeSelector",

        data() {
            return {
                drawing: false,
                drawMode: null,
                selected: undefined,
                options: [
                    {value: "rectangle", text: "Rectangle"},
                    {value: "textbox", text: "Text Box"},
                    {value: "stickynote", text: "Sticky Note"},
                ]
            }
        },

        methods: {
            toggleDrawing() {
                if (!this.drawing) {
                    this.drawing = true;
                    EventBus.$emit("set-drawing", this.selected);
                }
                else {
                    this.drawing = false;
                    EventBus.$emit("set-drawing", null);
                }

            }
        },

        mounted() {
            this.selected = this.options[0].value;
            EventBus.$on("set-drawing", drawing => {
                if (!drawing) {
                    this.drawing = false;
                }
            });
        },
    }
</script>

<style scoped>
    .mode-select {
        width: 8em !important;
        font-size: 10pt !important;
    }
</style>