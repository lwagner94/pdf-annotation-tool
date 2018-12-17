<template>
    <div>
        <button @click="toggleDrawing('textbox')">Textbox</button>
        <button @click="toggleDrawing('rectangle')">Rectangle</button>
        <button @click="toggleDrawing('stickynote')">Sticky Note</button>
        {{buttonText}}
    </div>
</template>

<script>
    import EventBus from "@/EventBus";
    export default {
        name: "DrawModeSelector",

        data() {
            return {
                drawMode: null
            }
        },

        methods: {
            toggleDrawing(mode) {
                EventBus.$emit("set-drawing", mode);
            }
        },

        mounted() {
            EventBus.$on("set-drawing", drawing => {
                this.drawMode = drawing;
            });
        },

        computed: {
            buttonText() {
                if (this.drawMode) {
                    return "Drawing " + this.drawMode;
                }

                return "Drawing disabled";
            }
        }
    }
</script>

<style scoped>

</style>