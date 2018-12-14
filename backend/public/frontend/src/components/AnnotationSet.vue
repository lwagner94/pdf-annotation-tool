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
                                localID: uuid()
                            });
                        }

                        this.$store.commit("setAnnotations", annotations);
                    })
            },

            annotations() {
                for (let annotation of this.annotations) {
                    if (annotation.id === null) {

                        console.log("New/Modified annotation: ", annotation);
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
                                    localID: annotation.localID
                                });
                            })
                    }
                }
            }
        }

    }
</script>

<style scoped>

</style>