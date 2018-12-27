<template>
    <div v-show="showSpinner" id="loader"></div>
</template>

<script>
    import EventBus from "@/EventBus";

    export default {
        name: "ProgressSpinner",

        data() {
            return {
                loading: false,
                showSpinner: false,
                timeoutHandle: null,
                start: Date.now(),
            }
        },

        mounted() {
            setInterval(() => {
                const timeDiff = Date.now() - this.start;

                if (this.loading) {
                    if (timeDiff > 200) {
                        this.showSpinner = true;
                    }
                }
                else {
                    this.showSpinner = false;
                }

            }, 100);

            EventBus.$on("show-spinner", (show) => {
                if (show) {
                    this.start = Date.now();
                }

                this.loading = show;
            });
        }
    }
</script>

<style scoped lang="less">
    @import "../style";


    #loader {
        left: 50%;
        bottom: 50%;
        position: absolute;
        border: 0.5em solid @mainTextColor;
        border-top: 0.5em solid @buttonPrimary;
        border-radius: 50%;
        width: 4em;
        height: 4em;
        animation: spin 1.5s linear infinite;
        z-index: 100;
    }

    #canvascontainer {
        left: 0em;
        right: 0em;
        width: 100%;
        height: 100%;
        position: absolute;
        z-index: 100;
    }


    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>