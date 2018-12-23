<template>
    <div id="app">

        <PDFViewer
                v-bind="{url, documentID}"
                @document-errored="onDocumentErrored"
        >
        </PDFViewer>
    </div>
</template>

<script>
    import PDFViewer from '../components/PDFViewer.vue'

    export default {
        name: 'app',

        components: {
            PDFViewer,
        },

        data() {
            let url = new URL(window.location.href);
            return {
                url: '/api/documents/' + url.searchParams.get("document"),
                documentError: undefined,
                documentID: url.searchParams.get("document")
            };
        },

        methods: {
            urlUpdated(url) {
                this.documentError = undefined;
                this.url = url;
            },
            onDocumentErrored(e) {
                this.documentError = e.text;
            },
        }

    }
</script>

<style>
    body {
        margin: 0;
        padding: 0;
        /*background-color: #606f7b;*/
        background-color: aliceblue;
    }

    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
    }

    .box-shadow {
        box-shadow: 0 15px 30px 0 rgba(0, 0, 0, 0.11), 0 5px 15px 0 rgba(0, 0, 0, 0.08);
    }

    .overflow-hidden {
        overflow: hidden;
    }
</style>
