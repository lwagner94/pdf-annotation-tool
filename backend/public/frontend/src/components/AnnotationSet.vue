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

        watch: {
            activeSetID(id) {
                fetch(`/api/annotationsets/${id}/annotations`)
                    .then(result => result.json())
                    .then(result => {
                        this.annotations = result;
                        console.log(this.annotations);
                    })
            }
        }

    }
</script>

<style scoped>

</style>