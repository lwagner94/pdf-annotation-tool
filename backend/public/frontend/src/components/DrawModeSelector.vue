<template>
    <button @click="toggleDrawing">{{buttonText}}</button>
</template>

<script>
    import EventBus from "@/EventBus";
    export default {
        name: "DrawModeSelector",

        data() {
            return {
                drawingEnabled: false
            }
        },

        methods: {
            toggleDrawing() {
                EventBus.$emit("set-drawing", !this.drawingEnabled);
            }
        },

        mounted() {
            EventBus.$on("set-drawing", drawing => {
                if (drawing) {
                    this.drawingEnabled = true;
                }
                else {
                    this.drawingEnabled = false;
                }
            });
        },

        computed: {
            buttonText() {
                if (this.drawingEnabled) {
                    return "Disable drawing mode";
                }

                return "Enable drawing mode";
            }
        }
    }
</script>

<style scoped>

</style>