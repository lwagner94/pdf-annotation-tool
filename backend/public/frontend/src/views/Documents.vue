<template>
    <div>
        <!--<div>-->
            <!--<ul>-->
                <!--<li v-for="document in documents" :key="document.id">-->
                    <!--<div>-->
                        <!--<img :src="'/api/documents/' + document.id + '/thumb'">-->
                        <!--<router-link :to="{ name: 'viewer', query: { document: document.id }}">{{document.name}}</router-link>-->
                        <!--<button @click="showDeletionDialog(document)">Delete document</button>-->
                    <!--</div>-->

                <!--</li>-->
            <!--</ul>-->
        <!--</div>-->

        <b-list-group>
            <b-list-group-item v-for="document in documents" :key="document.id">
                <div>
                    <b-img thumbnail :src="'/api/documents/' + document.id + '/thumb'">
                    </b-img>
                    <h1>
                        {{document.name}}
                    </h1>

                    <b-button :to="{ name: 'viewer', query: { document: document.id }}">Open</b-button>

                    <b-button @click="showDeletionDialog(document)">Delete document</b-button>
                </div>
            </b-list-group-item>

        </b-list-group>


        <button @click="showUploadDialog()">Upload</button>


        <b-modal ref="deletionModal" @ok="deleteDocument">
            <div>
                <span>Are you sure?</span>
            </div>
        </b-modal>

        <b-modal ref="uploadModal" @ok="uploadDocument">
                <input ref="fileField" type="file" accept="application/pdf">
        </b-modal>

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