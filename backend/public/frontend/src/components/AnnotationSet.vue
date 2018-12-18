<template>
    <div>
        <select v-model="activeSetID">
            <option v-for="annotationSet in annotationSets" :value="annotationSet.id" :key="annotationSet.id">
                {{annotationSet.name}}
            </option>
        </select>
        <a :href="exportUrl" download="export.json"><button>Export</button></a>
        <button @click="showImportDialog">Import</button>
        <modal-dialog ref="modal">
            <div>
                <input ref="fileField" type="file" accept="application/json">
                <button @click="importJson">Import</button>
            </div>
        </modal-dialog>
    </div>
</template>

<script>
    import {mapGetters} from 'vuex'
    import uuid from "uuid-random"

    import EventBus from "@/EventBus"
    import ModalDialog from "./ModalDialog";

    export default {
        name: "AnnotationSet",
        components: {ModalDialog},
        props: {
            documentID: String
        },

        data() {
            return {
                annotationSets: [],
                activeSetID: undefined,
            }
        },

        methods: {
            showImportDialog() {
                this.$refs.modal.setVisible(true);
            },

            importJson() {
                const reader = new FileReader();

                const self = this;
                reader.onload = async () => {
                    const text = reader.result;

                    const requestBody = {
                        documentID: self.documentID,
                        importedFile: text
                    };


                    const response = await fetch("/api/annotationsets/import", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(requestBody)
                    });

                    this.$refs.modal.setVisible(false);

                    this.fetchAnnotationSets();
                };

                reader.readAsText(this.$refs.fileField.files[0]);
            },

            createAnnotationSet(name, callback) {
                const self = this;

                const set = {
                    documentID: self.documentID,
                    name: name
                };

                fetch("/api/annotationsets/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(set)
                })
                    .then(response => {
                        // TODO: Error handling
                        if (callback) {
                            callback();
                        }
                    })
            },

            fetchAnnotationSets() {
                const self = this;

                fetch("/api/annotationsets")
                    .then(result => result.json())
                    .then(result => {
                        self.annotationSets = [];
                        for (let annotationSet of result) {
                            if (annotationSet.documentID === self.documentID) {
                                self.annotationSets.push(annotationSet);
                                self.activeSetID = annotationSet.id;
                            }
                        }

                        if (!self.annotationSets.length) {
                            self.createAnnotationSet("<default>", self.fetchAnnotationSets)
                        }
                    });
            },
        },

        mounted() {
            const self = this;
            self.fetchAnnotationSets();

            EventBus.$on("annotations-modified", () => {
                for (let annotation of self.annotations) {
                    if (annotation.created) {

                        let annotationToPost = {
                            setID: self.activeSetID,
                            pageNumber: annotation.pageNumber,
                            properties: annotation.properties
                        };

                        fetch(`/api/annotationsets/${self.activeSetID}/annotations`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(annotationToPost)
                        })
                            .then(response => {
                                const location = response.headers.get("location");
                                const id = location.split("/")[5];

                                self.$store.commit("storeAnnotation", {
                                    id: id,
                                    setID: self.activeSetID,
                                    pageNumber: annotation.pageNumber,
                                    properties: annotation.properties,
                                    localID: annotation.localID,
                                    dirty: false,
                                    created: false,
                                    deleted: false
                                });
                            });
                    } else if (annotation.dirty) {
                        let annotationToPost = {
                            pageNumber: annotation.pageNumber,
                            properties: annotation.properties
                        };

                        fetch(`/api/annotationsets/${self.activeSetID}/annotations/${annotation.id}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(annotationToPost)
                        })
                            .then(response => {
                                const location = response.headers.get("location");
                                const id = location.split("/")[5];

                                self.$store.commit("storeAnnotation", {
                                    id: id,
                                    setID: self.activeSetID,
                                    pageNumber: annotation.pageNumber,
                                    properties: annotation.properties,
                                    localID: annotation.localID,
                                    dirty: false,
                                    created: false,
                                    deleted: false
                                });
                            });
                    } else if (annotation.deleted) {
                        fetch(`/api/annotationsets/${self.activeSetID}/annotations/${annotation.id}`, {
                            method: "DELETE",
                        })
                            .then(() => {
                                // TODO: Check error!
                                self.$store.commit("deleteAnnotation", {
                                    localID: annotation.localID,
                                });
                            });
                    }

                }
            });

        },

        beforeDestroy() {
            EventBus.$off("annotations-modified");
        },

        computed: {
            ...mapGetters([
                "annotations"
            ]),

            exportUrl() {
                return `/api/annotationsets/${this.activeSetID}/export`;
            }
        },

        watch: {
            activeSetID(id) {
                fetch(`/api/annotationsets/${id}/annotations`)
                    .then(result => result.json())
                    .then(result => {
                        this.$store.commit("setAnnotations", []);
                        let annotations = [];

                        for (let annotation of result) {
                            annotations.push({
                                id: annotation.id,
                                setID: annotation.setID,
                                pageNumber: annotation.pageNumber,
                                properties: annotation.properties,
                                localID: uuid(),
                                dirty: false,
                                created: false,
                                deleted: false
                            });
                        }

                        this.$store.commit("setAnnotations", annotations);
                        EventBus.$emit("reload-annotations");
                    })
            },

        }

    }
</script>

<style scoped>

</style>