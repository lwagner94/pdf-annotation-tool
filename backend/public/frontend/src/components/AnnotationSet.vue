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

    export default {
        name: "AnnotationSet",

        props: {
            documentID: String
        },

        data() {
            return {
                annotationSets: [],
                activeSetID: undefined,
                annotations: []
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
                "addedAnnotations"
            ])
        },

        watch: {
            activeSetID(id) {
                fetch(`/api/annotationsets/${id}/annotations`)
                    .then(result => result.json())
                    .then(result => {
                        this.annotations = result;
                        this.$store.commit("setAnnotations", this.annotations);
                    })
            },

            addedAnnotations() {
                console.log("Added annotations: ", this.addedAnnotations);
            }
        }

    }
</script>

<style scoped>

</style>