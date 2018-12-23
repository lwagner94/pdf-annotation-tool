<template>
    <div>
        <b-navbar variant="my">
            <b-navbar-nav>
                <h3>PDF Annotation Tool</h3>
            </b-navbar-nav>

            <b-navbar-nav class="ml-auto">
                <b-button size="sm" @click="showUploadDialog()" variant="my-primary">Upload</b-button>
            </b-navbar-nav>

        </b-navbar>

        <div id="content">
            <div class="flex-container">
                <div class="flex-item" v-for="document in documents" :key="document.id">

                    <div class="thumb-container">
                        <router-link :to="{ name: 'viewer', query: { document: document.id }}">
                            <b-img thumbnail :src="'/api/documents/' + document.id + '/thumb'">
                            </b-img>
                        </router-link>
                    </div>
                    <div class="description">
                        <div class="button-container">
                            <a href="#" @click="showDeletionDialog(document)"><font-awesome-icon icon="trash-alt" /></a>
                            <!--<b-button size="sm" @click="showDeletionDialog(document)">Delete document</b-button>-->
                        </div>
                        <div class="document-title">
                            <strong>
                                {{document.name}}
                            </strong>
                        </div>

                    </div>




                </div>

            </div>

            <b-modal ref="deletionModal" @ok="deleteDocument">
                <div>
                    <span>Are you sure?</span>
                </div>
            </b-modal>

            <b-modal ref="uploadModal" @ok="uploadDocument">
                <input ref="fileField" type="file" accept="application/pdf">
            </b-modal>
        </div>
    </div>
</template>

<script>

    import ModalDialog from "../components/ModalDialog";
    export default {
        name: "Documents",
        components: {ModalDialog},
        data() {
            return {
                documents: [],
                modalVisible: false,
                uploadVisible: false,
                deleteVisible: false,
                document: undefined
            }
        },
        mounted()  {
            this.getDocuments();
        },

        methods: {
            getDocuments() {
                fetch("/api/documents")
                    .then(response => response.json())
                    .then(response => {
                        this.documents = response;
                    });
            },

            deleteDocument() {
                fetch("/api/documents/" + this.document.id, {
                    method: "DELETE",
                }).then(response => {
                    this.document = undefined;

                    setTimeout(() => {
                        this.getDocuments();
                    }, 100);

                })
            },


            uploadDocument() {
                const fileField = this.$refs.fileField;
                const formData = new FormData();
                formData.append("pdf", fileField.files[0]);

                fetch("/api/documents", {
                    method: "POST",
                    body: formData
                }).then(response => {
                    this.getDocuments();
                })
            },

            showDeletionDialog(document) {
                this.document = document;
                this.$refs.deletionModal.show();
            },

            showUploadDialog() {
                this.$refs.uploadModal.show();
            }
        }
    }
</script>

<style scoped lang="less">
    @import "../style.less";


    img {
        height: 100%;
        display: block;
    }

    .thumb-container {
        height: 100%;
        float: left;
        padding: 0.2em;
    }

    h3 {
        color: @mainTextColor;
    }

    #content {
        top: 3em;
    }


    .flex-container {
        display: flex;
        flex-wrap: wrap;
        padding: 2em;
    }

    .flex-item {
        width: 24em;
        height: 15em;
        border: 1px solid lightgrey;
        border-radius: 0.3em;
        margin: 0.5em;
        padding: 0.5em;
    }

    .description {
    }

    .button-container {
        text-align: left;
    }

</style>