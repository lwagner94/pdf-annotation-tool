<template>
    <div class="pdf-paginator">
        <template v-if="pageCount">
            <div class="input-group input-group-sm">
                <input
                        class="form-control select-my"
                        :value="value"
                        @input="input"
                        min="1"
                        :max="pageCount"
                        type="number"
                />
                <div class="input-group-append btn-my-primary">
                    <span class="input-group-text">of {{ pageCount }}</span>
                </div>
            </div>

        </template>
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
</style>
