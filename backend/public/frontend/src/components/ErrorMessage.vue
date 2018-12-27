<template>
    <div class="error-container">
        <b-alert :show="!dismissed" @dismissed="dismissed = true" dismissible variant="danger">
            {{message}}
        </b-alert>
    </div>
</template>

<script>
    import EventBus from "@/EventBus"

    export default {
        name: "ErrorMessage",

        data() {
            return {
                message: "Error",
                dismissed: true
            }
        },

        mounted() {
            EventBus.$on("show-error", (message) => {
                this.dismissed = false;
                this.message = message;
            });
        }
    }
</script>

<style scoped lang="less">
    .error-container {
        left: 20%;
        width: 60%;
        bottom: 0%;
        position: absolute;
        z-index: 100;
    }

</style>