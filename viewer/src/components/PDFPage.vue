<template>
    <div id="foobar">
        <div id="positioning" style="z-index: 1">
            <canvas ref="annotations" ></canvas>
        </div>
        <canvas ref="page" v-bind="canvasAttrs"></canvas>
    </div>

</template>

<script>
    import debug from 'debug';
    import {fabric} from 'fabric';

    const log = debug('app:components/PDFPage');

    import {PIXEL_RATIO} from '../utils/constants';

    export default {
        name: 'PDFPage',

        props: {
            page: {
                type: Object, // instance of PDFPageProxy returned from pdf.getPage
                required: true,
            },
            scale: {
                type: Number,
                required: true,
            },
            optimalScale: {
                type: Number,
                required: true,
            },
            isPageFocused: {
                type: Boolean,
                default: false,
            },
            isElementVisible: {
                type: Boolean,
                default: false,
            },
            isElementFocused: {
                type: Boolean,
                default: false,
            },
        },

        data() {
            return {
                annotations: undefined
            }
        },

        computed: {
            actualSizeViewport() {
                return this.viewport.clone({scale: this.scale});
            },

            canvasStyle() {
                const {width: actualSizeWidth, height: actualSizeHeight} = this.actualSizeViewport;
                const [pixelWidth, pixelHeight] = [actualSizeWidth, actualSizeHeight]
                    .map(dim => Math.ceil(dim / PIXEL_RATIO));
                return `width: ${pixelWidth}px; height: ${pixelHeight}px; position: relative; z-index: 0`;
            },

            canvasAttrs() {
                let {width, height} = this.viewport;
                [width, height] = [width, height].map(dim => Math.ceil(dim));
                const style = this.canvasStyle;

                return {
                    width,
                    height,
                    style,
                    class: 'pdf-page box-shadow',
                };
            },

            annotStyle() {
                const {width: actualSizeWidth, height: actualSizeHeight} = this.actualSizeViewport;
                const [pixelWidth, pixelHeight] = [actualSizeWidth, actualSizeHeight]
                    .map(dim => Math.ceil(dim / PIXEL_RATIO));
                return `width: ${pixelWidth}px; height: ${pixelHeight}px;`; // position: absolute; top: 0px; right: 0px; z-index: 1`;
            },

            annotAttrs() {
                let {width, height} = this.viewport;
                [width, height] = [width, height].map(dim => Math.ceil(dim));
                const style = this.annotStyle;

                return {
                    width,
                    height,
                    style,
                    class: 'pdf-page box-shadow',
                };
            },

            pageNumber() {
                return this.page.pageNumber;
            },
        },

        methods: {
            focusPage() {
                if (this.isPageFocused) return;

                this.$emit('page-focus', this.pageNumber);
            },

            drawPage() {
                if (this.renderTask) return;

                const {viewport} = this;
                const canvasContext = this.$refs.page.getContext('2d');
                const renderContext = {canvasContext, viewport};

                // PDFPageProxy#render
                // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
                this.renderTask = this.page.render(renderContext);
                this.renderTask
                    .then(() => {
                        this.$emit('page-rendered', {
                            page: this.page,
                            text: `Rendered page ${this.pageNumber}`,
                        });
                    })
                    .catch(response => {
                        this.destroyRenderTask();
                        this.$emit('page-errored', {
                            response,
                            page: this.page,
                            text: `Failed to render page ${this.pageNumber}`,
                        });
                    });
            },

            drawAnnotations: function() {
                console.log('in draw');
                const context = this.$refs.annotations;
                this.annotations = new fabric.Canvas(context);

                const {width: actualSizeWidth, height: actualSizeHeight} = this.actualSizeViewport;
                const [pixelWidth, pixelHeight] = [actualSizeWidth, actualSizeHeight]
                    .map(dim => Math.ceil(dim / PIXEL_RATIO));
                this.annotations.setWidth(pixelWidth);
                this.annotations.setHeight(pixelHeight);

                var square = new fabric.Textbox("foo", {
                    width: 100,
                    height: 100,
                    left: 100,
                    top: 100,
                    backgroundColor: "#000000",
                    fill: "#FFFFFF",
                    lockScalingY: true,
                    fontSize: 20
                });

                this.annotations.add(square);
                this.annotations.renderAll();

            },

            updateVisibility() {
                this.$parent.$emit('update-visibility');
            },

            destroyPage(page) {
                // PDFPageProxy#_destroy
                // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
                if (page) page._destroy();

                this.destroyRenderTask();

                this.annotations.dispose();
                delete this.annotations;
                this.annotations = undefined;
            },

            destroyRenderTask() {
                if (!this.renderTask) return;

                // RenderTask#cancel
                // https://mozilla.github.io/pdf.js/api/draft/RenderTask.html
                this.renderTask.cancel();
                delete this.renderTask;
            },
        },

        watch: {
            scale: function() {
                this.updateVisibility();

                if (this.isElementVisible) {
                    const {width: actualSizeWidth, height: actualSizeHeight} = this.actualSizeViewport;
                    const [pixelWidth, pixelHeight] = [actualSizeWidth, actualSizeHeight]
                        .map(dim => Math.ceil(dim / PIXEL_RATIO));
                    this.annotations.setWidth(pixelWidth);
                    this.annotations.setHeight(pixelHeight);
                }
            },

            page(_newPage, oldPage) {
                this.destroyPage(oldPage);
            },

            isElementFocused(isElementFocused) {
                if (isElementFocused) this.focusPage();
            },

            isElementVisible(isElementVisible) {
                if (isElementVisible) {
                    this.drawPage();
                    this.drawAnnotations();
                }
            },
        },

        created() {
            // PDFPageProxy#getViewport
            // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
            this.viewport = this.page.getViewport(this.optimalScale);
        },

        mounted() {
            log(`Page ${this.pageNumber} mounted`);
        },

        beforeDestroy() {
            this.destroyPage(this.page);
        },

        // render(h) {
        //     const {canvasAttrs: attrs} = this;
        //     return h('canvas', {attrs});
        //
        // },
    };
</script>
<style>
    #foobar {
        display: inline-block;
        position: relative;
    }

    #positioning {
        position: absolute;
    }

    .pdf-page {
        display: block;
        margin: 0 auto;
    }
</style>
