<template>
    <div>
        <b-input-group>
            <b-form-select v-model="activeSetID" size="sm">
                <option v-for="annotationSet in annotationSets" :value="annotationSet.id" :key="annotationSet.id">
                    {{annotationSet.name}}
                </option>
            </b-form-select>

            <b-dropdown size="sm" text="Annotation sets..." slot="append">
                <b-dropdown-item :href="exportUrl" download="export.json"><font-awesome-icon icon="file-export" /><span class="icon-clearance">Export</span></b-dropdown-item>
                <b-dropdown-item @click="showImport"><font-awesome-icon icon="file-import" /><span class="icon-clearance">Import</span></b-dropdown-item>
                <b-dropdown-divider></b-dropdown-divider>
                <b-dropdown-item @click="showCreateAnnotationSet"><font-awesome-icon icon="plus" /><span class="icon-clearance">Create Set</span></b-dropdown-item>
                <b-dropdown-item @click="deleteAnnotationSet"><font-awesome-icon icon="trash-alt" /><span class="icon-clearance">Delete Set</span></b-dropdown-item>
            </b-dropdown>
        </b-input-group>

        <b-modal ref="importModal" @ok="importJson">
            <input ref="fileField" type="file" accept="application/json">
        </b-modal>

        <b-modal ref="createSetModal" @ok="createAnnotationSetFromDialog">
            <input v-model="dialogSetName">
        </b-modal>
    </div>
</template>

<script>
    import {mapGetters} from 'vuex'
    import uuid from "uuid-random"

    import EventBus from "@/EventBus"

    export default {
        name: "AnnotationSet",
        components: {},
        props: {
            documentID: String
        },

        data() {
            return {
                annotationSets: [],
                activeSetID: undefined,
                dialogSetName: "New annotation set",
            }
        },

        methods: {
            showImport() {
                this.$refs.importModal.show();
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


                    this.fetchAnnotationSets();
                };

                reader.readAsText(this.$refs.fileField.files[0]);
            },

            createAnnotationSetFromDialog() {
                this.createAnnotationSet(this.dialogSetName);
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
                        self.fetchAnnotationSets();
                    })
            },

            deleteAnnotationSet() {
                const self = this;

                fetch("/api/annotationsets/" + this.activeSetID, {
                    method: "DELETE"
                }).then(response => {
                    self.fetchAnnotationSets();
                });
            },

            showCreateAnnotationSet() {
                this.$refs.createSetModal.show();
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
                            self.createAnnotationSet("<default>")
                        }
                    });
            },

            fetchAnnotations() {
                fetch(`/api/annotationsets/${this.activeSetID}/annotations`)
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
            }
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

            EventBus.$on("repeat-by-fontstyle", async (localID) => {
                const annotation = this.annotations.find(annotation => annotation.localID === localID);
                const response = await fetch(`/api/annotationsets/${this.activeSetID}/annotations/${annotation.id}/byfontstyle`);

                this.fetchAnnotations();

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
                this.fetchAnnotations();
            },

        }

    }
</script>

<style scoped lang="less">
    select {
        width: 10em;
    }
</style>