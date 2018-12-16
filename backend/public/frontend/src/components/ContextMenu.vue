<template>
    <div class="menu" ref="menu" :style="style">
        <ul class="menu-options">
            <li v-for="entry in menuEntries"
                :key="entry.identifier"
                @click="dispatch(entry)"
                class="menu-option">{{entry.text}}</li>
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
    .menu {
        width: 120px;
        box-shadow: 0 4px 5px 3px rgba(0, 0, 0, 0.2);
        position: absolute;
        display: none;
        z-index: 10;
        user-select: none;
        background: darkgrey;

        .menu-options {
            list-style: none;
            padding: 10px 0;

            .menu-option {
                font-weight: 500;
                font-size: 14px;
                padding: 10px 40px 10px 20px;
                cursor: pointer;

                &:hover {
                    background: rgba(0, 0, 0, 0.2);
                }
            }
        }
    }
</style>