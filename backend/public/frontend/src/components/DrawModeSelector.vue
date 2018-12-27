<template>
    <div>
        <b-input-group size="sm">
            <b-dropdown size="sm" split :variant="buttonVariant" @click="toggleDrawing">
                <template slot="button-content">
                    <template v-if="!drawing">
                        Draw {{selected.text}}
                    </template>
                    <template v-else>
                        Stop draw mode
                    </template>

                </template>

                <b-dropdown-item v-for="option in options"
                                 :key="option.value"
                                 @click="setSelected(option)">
                    {{option.text}}
                </b-dropdown-item>


            </b-dropdown>

        </b-input-group>
    </div>
</template>

<script>
    import EventBus from "@/EventBus";
    export default {
        name: "DrawModeSelector",

        data() {
            return {
                buttonVariant: "my-primary",
                drawing: false,
                selected: {},
                options: [
                    {value: "rectangle", text: "Rectangle"},
                    {value: "textbox", text: "Text Box"},
                    {value: "stickynote", text: "Sticky Note"},
                ]
            }
        },

        methods: {
            setSelected(option) {
                this.selected = option;
            },

            toggleDrawing() {
                if (!this.drawing) {
                    this.drawing = true;
                    EventBus.$emit("set-drawing", this.selected.value);
                }
                else {
                    this.drawing = false;
                    EventBus.$emit("set-drawing", null);
                }

            }
        },

        mounted() {
            this.selected = this.options[0];
            EventBus.$on("set-drawing", drawing => {
                if (!drawing) {
                    this.drawing = false;
                    this.buttonVariant = "my-primary";
                }
                else {
                    this.buttonVariant = "my-primary-draw-active";
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