<template>
    <div class="pdf-paginator">
        <template v-if="pageCount">
            <div class="input-group">
                <input
                        class="form-control"
                        :value="value"
                        @input="input"
                        min="1"
                        :max="pageCount"
                        type="number"
                />
                <div class="input-group-append">
                    <span class="input-group-text">of {{ pageCount }}</span>
                </div>
            </div>

        </template>
        <!--<b-form-input v-else type="number"></b-form-input>-->
    </div>
</template>

<script>
    export default {
        name: 'PDFPaginator',

        props: {
            value: Number,
            pageCount: Number,
        },

        methods: {
            input(event) {
                this.$emit('input', parseInt(event.target.value, 10));
            },
        },

        watch: {
            pageCount() {
                this.$emit('input', 1);
            },
        }
    }
</script>

<style scoped>
    /*.pdf-paginator {*/
        /*color: white;*/
        /*font-weight: bold;*/
    /*}*/

    /*.pdf-paginator input {*/
        /*width: 2em;*/
        /*padding: 0.3em;*/
    /*}*/

    .nobreak {
        white-space: nowrap;
    }
</style>
