<template>
    <div id="app">
        <header>
            <router-link to="/viewer"><a>Viewer</a></router-link>
            <router-link to="/documents"><a>Documents</a></router-link>
        </header>
        <router-view/>
    </div>
</template>

<script>
    export default {
        name: "App.vue"
    }
</script>

<style scoped lang="less">
    header {
        height: 2em;
    }
</style>