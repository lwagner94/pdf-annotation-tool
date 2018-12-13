import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
    state: {
        annotations: []
    },

    mutations: {
        setAnnotations: (state, annotations) => {
            state.annotations = annotations;
        }
    },

    getters: {
        getAnnotationsForPage: state => page => {
            return state.annotations.filter(annotation => annotation.pageNumber === page);
        }
    },

    strict: debug,
})