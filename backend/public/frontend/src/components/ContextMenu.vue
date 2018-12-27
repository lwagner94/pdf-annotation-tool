<template>
    <div class="context-menu" ref="menu" :style="style">
        <ul class="context-menu-options">
            <li @click="deleteCB(); visible = false" class="context-menu-option">
                <font-awesome-icon icon="trash-alt"></font-awesome-icon><span class="icon-clearance">Delete</span>
            </li>
            <li @click="repeatCB(); visible = false" class="context-menu-option">
                <font-awesome-icon icon="redo"></font-awesome-icon><span class="icon-clearance">Repeat Annotation...</span>
            </li>

            <hr>

            <li v-for="label in labels"
                :key="label.id"
                @click="setLabelCB(label); visible = false"
                class="context-menu-option">
                <span :style="'color: ' + label.color"><font-awesome-icon icon="circle" /></span>
                <span class="icon-clearance">{{label.name}}</span>
                <span class="icon-clearance" v-if="activeLabel.name === label.name">
                    <font-awesome-icon icon="check"></font-awesome-icon>
                </span>
            </li>
        </ul>
    </div>
</template>

<script>
    import {mapGetters} from 'vuex';

    export default {
        name: "ContextMenu",

        data() {
            return {
                visible: false,
                left: 100,
                top: 100,
                deleteCB: null,
                setLabelCB: null,
                repeatCB: null,
                activeLabel: {}
            }
        },

        computed: {
            style() {
                return {
                    display: this.visible ? "block" : "none",
                    left: this.left + "px",
                    top: this.top + "px"
                }
            },

            ...mapGetters([
                "labels",
            ]),
        },

        methods: {
            setVisible(visible) {
                this.visible = visible;
            },

            setPosition(x, y) {
                this.left = x;
                this.top = y;
            },

            setDeleteCallback(cb) {
                this.deleteCB = cb;
            },


            setRepeatCallback(cb) {
                this.repeatCB = cb;
            },

            setLabelCallback(cb) {
                this.setLabelCB = cb;
            },

            setActiveLabel(label) {
                this.activeLabel = label;
            },

            cleanup() {
                this.deleteCB = null;
                this.repeatCB = null;
                this.setLabelCB = null;
            }
        },
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