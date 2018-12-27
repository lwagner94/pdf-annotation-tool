<template>
        <div v-show="loading" id="loader"></div>
</template>

<script>
    import EventBus from "@/EventBus";

    export default {
        name: "ProgressSpinner",

        data() {
            return {
                loading: false,
                timeoutHandle: null
            }
        },

        mounted() {
            EventBus.$on("show-spinner", (show) => {
                if (show) {
                    this.timeoutHandle = setTimeout(() => {
                        this.loading = true;
                    }, 500);
                }
                else {
                    if (this.timeoutHandle) {
                        clearTimeout(this.timeoutHandle);
                    }
                    this.loading = false;
                }
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
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
</style>