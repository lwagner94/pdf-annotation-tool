<template>
    <div>
        <div>
            <ul>
                <li v-for="document in documents" :key="document.id">
                    <div>
                        <img :src="'/api/documents/' + document.id + '/thumb'">
                        <router-link :to="{ name: 'viewer', query: { document: document.id }}">{{document.name}}</router-link>
                        <button @click="showDeletionDialog(document)">Delete document</button>
                    </div>

                </li>
            </ul>
        </div>

        <button @click="showUploadDialog()">Upload</button>

        <modal-dialog ref="modal">
            <div>
                <div v-show="uploadVisible">
                    <input ref="fileField" type="file" accept="application/pdf">
                    <button @click="uploadDocument">Upload</button>
                </div>
                <div v-show="deleteVisible">
                    <span>Are you sure?</span>
                    <button @click="deleteDocument()">Yes</button>
                    <button @click="setVisible(false)">No</button>
                </div>
            </div>
        </modal-dialog>
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
                        this.setVisible(false);
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
                    this.setVisible(false);
                    this.getDocuments();
                })
            },

            setVisible(visible) {
                this.$refs.modal.setVisible(visible);
            },

            showDeletionDialog(document) {
                this.document = document;
                this.deleteVisible = true;
                this.uploadVisible = false;
                this.setVisible(true);
            },

            showUploadDialog() {
                this.uploadVisible = true;
                this.deleteVisible = false;
                this.setVisible(true);
            }
        }
    }
</script>

<style scoped lang="less">
    img {
        height: 200px;
    }

    .modal {
        /*display: none; !* Hidden by default *!*/
        position: fixed; /* Stay in place */
        z-index: 1; /* Sit on top */
        left: 0;
        top: 0;
        width: 100%; /* Full width */
        height: 100%; /* Full height */
        overflow: auto; /* Enable scroll if needed */
        background-color: rgb(0,0,0); /* Fallback color */
        background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
    }

    /* Modal Content/Box */
    .modal-content {
        background-color: #fefefe;
        margin: 15% auto; /* 15% from the top and centered */
        padding: 20px;
        border: 1px solid #888;
        width: 80%; /* Could be more or less, depending on screen size */
    }

    /* The Close Button */
    .close {
        color: #aaa;
        float: right;
        font-size: 28px;
        font-weight: bold;
    }

    .close:hover,
    .close:focus {
        color: black;
        text-decoration: none;
        cursor: pointer;
    }
</style>