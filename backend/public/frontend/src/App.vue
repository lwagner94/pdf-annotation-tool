<template>
    <div id="app">
        <header>
            <router-link to="/viewer"><a>Viewer</a></router-link>

        </header>
        <router-view/>
    </div>
</template>

<script>
    export default {
        name: "App.vue"
    }
</script>

<style scoped>

</style>