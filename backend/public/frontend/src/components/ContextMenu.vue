<template>
    <div class="context-menu" ref="menu" :style="style">
        <ul class="context-menu-options">
            <li v-for="entry in menuEntries"
                :key="entry.identifier"
                @click="dispatch(entry)"
                class="context-menu-option">{{entry.text}}</li>
        </ul>
    </div>
</template>

<script>
    export default {
        name: "ContextMenu",

        data() {
            return {
                visible: false,
                left: 100,
                top: 100,
                menuEntries: [
                    {
                        identifier: "Test",
                        text: "Test",
                        action: () => console.log("This is a test.")
                    }
                ]
            }
        },

        computed: {
            style() {
                return {
                    display: this.visible ? "block" : "none",
                    left: this.left + "px",
                    top: this.top + "px"
                }
            }
        },

        methods: {
            setVisible(visible) {
                this.visible = visible;
            },

            setPosition(x, y) {
                this.left = x;
                this.top = y;
            },

            dispatch(entry) {
                entry.action();
                this.visible = false;
            },

            setMenuEntries(entries) {
                this.menuEntries = entries;
            }
        }
    }
</script>

<style scoped lang="less">
    @import "../style.less";

    .context-menu {
        width: 16em;
        border: 1px solid lightgrey;
        border-radius: 0.4em;
        position: absolute;
        z-index: 10;
        user-select: none;
        background: white;
        color: black;

        .context-menu-options {
            list-style: none;
            padding: 0.5em 0.2em;

            .context-menu-option {
                font-weight: 500;
                font-size: 12pt;
                padding: 0.5em 0.5em 0.5em 0.5em;
                cursor: pointer;
                text-align: left;

                &:hover {
                    background-color: rgba(0, 0, 0, 0.03);
                }
            }
        }
    }
</style>