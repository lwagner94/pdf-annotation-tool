<template>
    <div>
        <select v-model="activeSetID">
            <option v-for="annotationSet in annotationSets" :key="annotationSet.id">
                {{annotationSet.id}}
            </option>
        </select>
    </div>
</template>

<script>
    import {mapGetters} from 'vuex'
    import uuid from "uuid-random"

    import EventBus from "@/EventBus"

    export default {
        name: "AnnotationSet",

        props: {
            documentID: String
        },

        data() {
            return {
                annotationSets: [],
                activeSetID: undefined,
            }
        },

        mounted() {
            fetch("/api/annotationsets")
                .then(result => result.json())
                .then(result => {
                    this.annotationSets = [];
                    for (let annotationSet of result) {
                        if (annotationSet.documentID === this.documentID) {
                            this.annotationSets.push(annotationSet);
                            this.activeSetID = annotationSet.id;
                        }
                    }
                });

            EventBus.$on("annotations-modified", () => {
                for (let annotation of this.annotations) {
                    if (annotation.created) {

                        let annotationToPost = {
                            setID: this.activeSetID,
                            pageNumber: annotation.pageNumber,
                            properties: annotation.properties
                        };

                        fetch(`/api/annotationsets/${this.activeSetID}/annotations`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(annotationToPost)
                        })
                            .then(response => {
                                const location = response.headers.get("location");
                                const id = location.split("/")[5];
                                console.log(location, id);

                                this.$store.commit("storeAnnotation", {
                                    id: id,
                                    setID: this.activeSetID,
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

                        fetch(`/api/annotationsets/${this.activeSetID}/annotations/${annotation.id}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(annotationToPost)
                        })
                            .then(response => {
                                const location = response.headers.get("location");
                                const id = location.split("/")[5];

                                this.$store.commit("storeAnnotation", {
                                    id: id,
                                    setID: this.activeSetID,
                                    pageNumber: annotation.pageNumber,
                                    properties: annotation.properties,
                                    localID: annotation.localID,
                                    dirty: false,
                                    created: false,
                                    deleted: false
                                });
                            });
                    } else if (annotation.deleted) {
                        fetch(`/api/annotationsets/${this.activeSetID}/annotations/${annotation.id}`, {
                            method: "DELETE",
                        })
                            .then(() => {
                                // TODO: Check error!
                                this.$store.commit("deleteAnnotation", {
                                    localID: annotation.localID,
                                });
                            });
                    }

                }
            });

        },

        computed: {
            ...mapGetters([
                "annotations"
            ])
        },

        watch: {
            activeSetID(id) {
                fetch(`/api/annotationsets/${id}/annotations`)
                    .then(result => result.json())
                    .then(result => {
                        let annotations = [];

                        for (let annotation of result) {
                            annotations.push({
                                id: annotation.id,
                                setID: annotation.setID,
                                pageNumber: annotation.pageNumber,
                                properties: annotation.properties,
                                localID: uuid(),
                                dirty: false
                            });
                        }

                        this.$store.commit("setAnnotations", annotations);
                    })
            },

        }

    }
</script>

<style scoped>

</style>