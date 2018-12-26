<template>
    <div>
        <div class="float-left">
            <b-input-group>
                <b-dropdown size="sm" variant="my-primary">
                    <template slot="button-content">
                        <span :style="'color: ' + activeLabel.color"><font-awesome-icon icon="circle" /></span><span class="icon-clearance">{{activeLabel.name}}</span>
                    </template>

                    <b-dropdown-item v-for="label in labels"
                                     :key="label.id"
                                     @click="setActiveLabel(label)">
                        <span :style="'color: ' + label.color"><font-awesome-icon icon="circle" /></span><span class="icon-clearance">{{label.name}}</span>
                    </b-dropdown-item>
                    <b-dropdown-divider></b-dropdown-divider>
                    <b-dropdown-item @click="showCreateLabel"><font-awesome-icon icon="plus" /><span class="icon-clearance">Create Label</span></b-dropdown-item>
                    <b-dropdown-item @click="deleteLabel"><font-awesome-icon icon="trash-alt" /><span class="icon-clearance">Delete Label</span></b-dropdown-item>
                </b-dropdown>


                <!--<b-dropdown size="sm" text="Manage labels" slot="append" variant="my-primary">-->
                    <!---->
                <!--</b-dropdown>-->
            </b-input-group>

        </div>
        <div class="float-left">
            <b-input-group>
                <!--<b-form-select v-model="activeSetID" size="sm" class="mode-select">-->
                    <!--<option v-for="annotationSet in annotationSets" :value="annotationSet.id" :key="annotationSet.id">-->
                        <!--{{annotationSet.name}}-->
                    <!--</option>-->
                <!--</b-form-select>-->

                <b-dropdown size="sm" text="Manage sets" variant="my-primary">
                    <template slot="button-content">
                        {{activeSet.name}}
                    </template>

                    <b-dropdown-item v-for="annotationSet in annotationSets" :key="annotationSet.id" @click="setActiveSet(annotationSet)">
                        {{annotationSet.name}}
                    </b-dropdown-item>

                    <b-dropdown-divider></b-dropdown-divider>
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

            <b-modal ref="createLabelModal" @ok="createLabelFromDialog">
                <b-form-input v-model="labelName"
                              type="text"
                              placeholder="Enter label name"></b-form-input>
                <div id="colorpicker">
                    <compact-picker v-model="labelColor"></compact-picker>
                </div>
            </b-modal>
        </div>
    </div>
</template>

<script>
    import {mapGetters} from 'vuex'
    import uuid from "uuid-random"

    import EventBus from "@/EventBus"
    import {Compact} from 'vue-color'

    export default {
        name: "AnnotationSet",
        components: {
            'compact-picker': Compact
        },
        props: {
            documentID: String
        },

        data() {
            return {
                annotationSets: [],
                labels: [],
                activeLabel: {},
                activeSet: {},
                dialogSetName: "New annotation set",
                labelName: undefined,
                labelColor: "#FF0000"
            }
        },

        methods: {
            setActiveLabel(label) {
                this.activeLabel = label;
                this.$store.commit("setActiveLabel", this.activeLabel);
            },

            setActiveSet(set) {
                this.activeSet = set;
            },

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

            createLabelFromDialog() {
                this.createLabel(this.labelName, this.labelColor.hex);
            },

            createAnnotationSet(name) {
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

            createLabel(name, color) {
                const self = this;

                const label = {
                    name: name,
                    color: color
                };

                fetch(`/api/annotationsets/${this.activeSet.id}/labels`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(label)
                })
                    .then(response => {
                        // TODO: Error handling
                        self.fetchLabels();
                    })
            },

            deleteLabel() {
                const self = this;

                fetch(`/api/annotationsets/${this.activeSet.id}/labels/` + this.activeLabel.id, {
                    method: "DELETE"
                }).then(response => {
                    self.fetchLabels();
                });
            },

            deleteAnnotationSet() {
                const self = this;

                fetch("/api/annotationsets/" + this.activeSet.id, {
                    method: "DELETE"
                }).then(response => {
                    self.fetchAnnotationSets();
                });
            },

            showCreateAnnotationSet() {
                this.$refs.createSetModal.show();
            },

            showCreateLabel() {
                this.$refs.createLabelModal.show();
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
                                self.activeSet = annotationSet;
                            }
                        }

                        if (!self.annotationSets.length) {
                            self.createAnnotationSet("<default>")
                        }
                    });
            },

            fetchAnnotations() {
                fetch(`/api/annotationsets/${this.activeSet.id}/annotations`)
                    .then(result => result.json())
                    .then(result => {
                        this.$store.commit("setAnnotations", []);
                        let annotations = [];

                        for (let annotation of result) {
                            annotations.push({
                                id: annotation.id,
                                setID: annotation.setID,
                                labelID: annotation.labelID,
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

            fetchLabels() {
                fetch(`/api/annotationsets/${this.activeSet.id}/labels`)
                    .then(result => result.json())
                    .then(result => {
                        let labels = [];

                        for (let label of result) {
                            labels.push({
                                id: label.id,
                                setID: label.setID,
                                name: label.name,
                                color: label.color
                            });
                        }

                        if (!labels.length) {
                            this.createLabel("<default>", "#FFFF00");
                        }
                        else {
                            this.labels = labels;
                            this.setActiveLabel(labels[0]);
                            this.$store.commit("setLabels", labels);
                        }
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
                            setID: self.activeSet.id,
                            labelID: annotation.labelID,
                            pageNumber: annotation.pageNumber,
                            properties: annotation.properties
                        };

                        fetch(`/api/annotationsets/${self.activeSet.id}/annotations`, {
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
                                    setID: self.activeSet.id,
                                    labelID: annotation.labelID,
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
                            labelID: annotation.labelID,
                            pageNumber: annotation.pageNumber,
                            properties: annotation.properties
                        };

                        fetch(`/api/annotationsets/${self.activeSet.id}/annotations/${annotation.id}`, {
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
                                    setID: self.activeSet.id,
                                    labelID: annotation.labelID,
                                    pageNumber: annotation.pageNumber,
                                    properties: annotation.properties,
                                    localID: annotation.localID,
                                    dirty: false,
                                    created: false,
                                    deleted: false
                                });
                            });
                    } else if (annotation.deleted) {
                        fetch(`/api/annotationsets/${self.activeSet.id}/annotations/${annotation.id}`, {
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
                const response = await fetch(`/api/annotationsets/${this.activeSet.id}/annotations/${annotation.id}/byfontstyle`);

                this.fetchAnnotations();

            });

        },

        beforeDestroy() {
            EventBus.$off("annotations-modified");
            EventBus.$off("repeat-by-fontstyle");
        },

        computed: {
            ...mapGetters([
                "annotations",
            ]),

            exportUrl() {
                return `/api/annotationsets/${this.activeSet.id}/export`;
            },

        },

        watch: {
            activeSet() {
                this.fetchLabels();
                this.fetchAnnotations();
            },

        }

    }
</script>

<style scoped lang="less">
    .mode-select {
        width: 8em !important;
        font-size: 10pt !important;
    }

    .float-left {
        float: left;
        padding-left: 0.5em;
    }

    #colorpicker {
        margin: 2em;
        display: flex;
        justify-content: center;
    }
</style>