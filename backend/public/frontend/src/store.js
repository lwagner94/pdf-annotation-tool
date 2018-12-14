import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
    state: {
        annotations: [],
    },

    mutations: {
        setAnnotations: (state, annotations) => {
            state.annotations = annotations;
        },

        storeAnnotation: (state, annotation) => {
            let index = state.annotations.findIndex(a => a.localID === annotation.localID);

            if (index >= 0) {
                state.annotations[index] = annotation;
            }
            else {
                state.annotations.push(annotation);
            }
        }
    },

    getters: {
        annotationsForPage: state => page => {
            return state.annotations.filter(annotation => annotation.pageNumber === page);
        }
    },

    strict: debug,
})