<template>
    <div class="pdf-zoom">
        <b-button-group size="sm" variant="my">
            <b-button  @click.prevent.stop="zoomIn" :disabled="isDisabled" variant="my-primary" >
                <font-awesome-icon icon="search-plus" />
            </b-button>
            <b-button @click.prevent.stop="zoomOut" :disabled="isDisabled" variant="my-primary">
                <font-awesome-icon icon="search-minus" />
            </b-button>
            <b-button @click.prevent.stop="fitWidth" :disabled="isDisabled" variant="my-primary">
                <font-awesome-icon icon="expand" />
            </b-button>
            <b-button @click.prevent.stop="fitAuto" :disabled="isDisabled" variant="my-primary">
                <font-awesome-icon icon="compress" />

            </b-button>
        </b-button-group>

    </div>
</template>

<script>
    import ZoomInIcon from '../assets/icon-zoom-in.svg';
    import ZoomOutIcon from '../assets/icon-zoom-out.svg';
    import ExpandIcon from '../assets/icon-expand.svg';
    import ShrinkIcon from '../assets/icon-shrink.svg';


    export default {
        name: 'PDFZoom',

        components: {
            ZoomInIcon,
            ZoomOutIcon,
            ExpandIcon,
            ShrinkIcon,
        },

        props: {
            scale: {
                type: Number,
            },
            increment: {
                type: Number,
                default: 0.25,
            },
        },

        data() {
            return {
            }
        },

        computed: {
            isDisabled() {
                return !this.scale;
            },
        },

        methods: {
            zoomIn() {
                this.updateScale(this.scale + this.increment);
            },

            zoomOut() {
                if (this.scale <= this.increment) return;
                this.updateScale(this.scale - this.increment);
            },

            updateScale(scale) {
                this.$emit('change', {scale});
            },

            fitWidth() {
                this.$emit('fit', 'width');
            },

            fitAuto() {
                this.$emit('fit', 'auto');
            },
        },
    }
</script>

<style>
    .pdf-zoom a {
        float: left;
        cursor: pointer;
        display: block;
        border: 1px #333 solid;
        background: white;
        color: #333;
        font-weight: bold;
        line-height: 1em;
        width: 1em;
        height: 1em;
        font-size: 1em;
    }

    .zoom-icon {
        width: 1.5em;
    }
</style>
