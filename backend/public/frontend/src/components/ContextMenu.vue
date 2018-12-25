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
        width: 10em;
        box-shadow: 0.1em 0.1em 0.1em 0.1em rgba(0, 0, 0, 0.2);
        position: absolute;
        z-index: 10;
        user-select: none;
        background: @contextMenu;
        color: @mainTextColor;

        .context-menu-options {
            list-style: none;
            padding: 0.5em 0.2em;

            .context-menu-option {
                font-weight: 500;
                font-size: 10pt;
                /*padding: 10px 40px 10px 20px;*/
                cursor: pointer;
                text-align: left;

                &:hover {
                    background-color: @buttonHover;
                }
            }
        }
    }
</style>