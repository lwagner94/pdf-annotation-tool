<template>
    <div>
        <ul>
            <li v-for="document in documents" :key="document.id">
                <div>
                    <img :src="'/api/documents/' + document.id + '/thumb'">
                    <router-link :to="{ name: 'viewer', query: { document: document.id }}">{{document.name}}</router-link>
                </div>

            </li>
        </ul>
    </div>
</template>

<script>
    export default {
        name: "Documents",

        data() {
            return {
                documents: []
            }
        },
        mounted()  {
            fetch("/api/documents")
                .then(response => response.json())
                .then(response => {
                    this.documents = response;
                });
        }
    }
</script>

<style scoped lang="less">
    img {
        height: 200px;
    }
</style>