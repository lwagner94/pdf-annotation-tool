<template>
    <div id="app">
        <router-view/>
    </div>
</template>

<script>
    export default {
        name: "App"
    }
</script>

<style lang="less">
    @import "./style.less";

    .bg-my {
        height: 3em;
        background-color: @navbarMain;
        color: @mainTextColor;
    }

    .btn-my-primary {
        background-color: @buttonPrimary;
        color: @mainTextColor;
    }

    .btn-my-primary:hover {
        background-color: @buttonHover;
        color: @mainTextColor;
    }

    .btn-my-primary:focus {
        box-shadow: none !important;
    }


    .btn-my-primary-draw-active {
        background-color: @buttonDrawingActive;
        color: @mainTextColor;
    }

    .btn-my-primary-draw-active:hover {
        background-color: @buttonDrawingActiveHover;
        color: @mainTextColor;
    }

    .btn-my-primary-draw-active:focus {
        box-shadow: none !important;
    }



    html {
        background-color: @mainBackground;
    }

    #app {
        background-color: @mainBackground;
    }

</style>