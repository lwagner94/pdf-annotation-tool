<template>
    <div id="foobar" v-bind:style="annotStyle" class="pdf-page box-shadow">
        <div v-if="showPage">
            <div id="positioning" style="z-index: 1">
                <canvas ref="annotations" ></canvas>
            </div>
            <canvas ref="page" v-bind="canvasAttrs"></canvas>
            <context-menu ref="menu">
            </context-menu>
        </div>
    </div>

</template>

<script>
    import debug from 'debug';
    import EventBus from "@/EventBus"
    import Annotations from "../annotations"

    const log = debug('app:components/PDFPage');

    import {PIXEL_RATIO} from '../utils/constants';
    import ContextMenu from "./ContextMenu";

    document.addEventListener('contextmenu', event => event.preventDefault());

    export default {
        name: 'PDFPage',
        components: {ContextMenu},
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
                annotations: undefined,
                showPage: false,

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
                const context = this.$refs.annotations;

                const {width: actualSizeWidth, height: actualSizeHeight} = this.actualSizeViewport;
                const [pixelWidth, pixelHeight] = [actualSizeWidth, actualSizeHeight]
                    .map(dim => Math.ceil(dim / PIXEL_RATIO));
                this.annotations = new Annotations(context, pixelWidth, pixelHeight, this.scale, this.pageNumber, this.$refs.menu);
            },


            setDrawingMode(param) {
                this.annotations.setEnableDrawing(param);
            },

            updateVisibility() {
                this.$parent.$emit('update-visibility');
            },

            destroyPage(/*page*/) {
                // PDFPageProxy#_destroy
                // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html


                // TODO: Investigate why this fixes the page rendering bug
                //if (page) page._destroy();

                console.log("destorying");
                this.destroyRenderTask();

                if (this.annotations)
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
            scale: function(scale) {
                this.updateVisibility();

                if (this.isElementVisible) {
                    const {width: actualSizeWidth, height: actualSizeHeight} = this.actualSizeViewport;
                    const [pixelWidth, pixelHeight] = [actualSizeWidth, actualSizeHeight]
                        .map(dim => Math.ceil(dim / PIXEL_RATIO));
                    this.annotations.width = pixelWidth;
                    this.annotations.height = pixelHeight;

                    this.annotations.scale = scale;
                    this.annotations.render();
                }
            },

            page(_newPage, oldPage) {
                this.destroyPage(oldPage);
            },

            isElementFocused(isElementFocused) {
                if (isElementFocused) this.focusPage();
            },

            isElementVisible(isElementVisible) {
                this.showPage = isElementVisible;

                if (isElementVisible) {
                    this.$nextTick(() => {
                        this.drawPage();
                        this.drawAnnotations();
                    });
                }
                else {
                    this.$nextTick(() => {
                        this.destroyPage(this.page);
                    });
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

            const self = this;
            EventBus.$on("reload-annotations", () => {
                if (self.annotations)
                    self.annotations.dispose();
                delete self.annotations;
                self.annotations = undefined;

                self.drawAnnotations();
            });

        },

        beforeDestroy() {
            this.destroyPage(this.page);
        },
    };
</script>
<style lang="less">
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
