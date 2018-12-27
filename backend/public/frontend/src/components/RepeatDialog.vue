<template>
    <b-modal ref="modal" @ok="apply">
        <b-form-select v-model="mode">
            <option value="fontstyle">By font style</option>
            <option value="pagenum">By page number</option>
        </b-form-select>

        <div v-show="mode === 'pagenum'">
            <b-form-group label="Apply to:">
                <b-form-radio-group v-model="pageNumMode">
                    <b-form-radio value="all">All pages</b-form-radio>
                    <b-form-radio value="even">Even pages</b-form-radio>
                    <b-form-radio value="odd">Odd pages</b-form-radio>
                </b-form-radio-group>
            </b-form-group>
        </div>
    </b-modal>
</template>

<script>
    import EventBus from "@/EventBus";

    export default {
        name: "RepeatDialog",

        data() {
            return {
                mode: "pagenum",
                pageNumMode: "all",
                localID: undefined,
            }
        },

        mounted() {
            EventBus.$on("show-repeat-dialog", (localID) => {
                this.localID = localID;
                this.$refs.modal.show();
            });
        },

        methods: {
            apply() {
                if (this.mode === "fontstyle") {
                    EventBus.$emit("repeat-by-fontstyle", this.localID);
                }
                else if (this.mode === "pagenum") {
                    EventBus.$emit("repeat-by-page", this.localID, this.pageNumMode);
                }

            }
        },

        // computed: {
        //     showPageNumOptions() {
        //         return this.mode
        //     }
        // }
    }
</script>

<style scoped>

</style>