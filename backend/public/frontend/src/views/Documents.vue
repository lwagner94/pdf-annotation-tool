<template>
    <div>
        <b-navbar variant="dark">
            <b-navbar-nav>
                <h2>PDF Annotation Tool</h2>
            </b-navbar-nav>

            <b-navbar-nav class="ml-auto">
                <b-button size="sm" @click="showUploadDialog()">Upload</b-button>
            </b-navbar-nav>

        </b-navbar>

        <div id="content">
            <b-list-group>
                <b-list-group-item v-for="document in documents" :key="document.id">
                    <b-container>
                        <b-row>
                            <b-col>
                                <b-img thumbnail :src="'/api/documents/' + document.id + '/thumb'">
                                </b-img>
                            </b-col>
                            <b-col>
                                <h3>
                                    {{document.name}}
                                </h3>

                                <b-button :to="{ name: 'viewer', query: { document: document.id }}">Open</b-button>

                                <b-button @click="showDeletionDialog(document)">Delete document</b-button>
                            </b-col>
                        </b-row>

                    </b-container>
                </b-list-group-item>

            </b-list-group>

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
    img {
        height: 200px;
    }

    h2 {
        color: grey;
    }

    #content {
        top: 3em;
    }

    nav {
        height: 3em;
    }

</style>