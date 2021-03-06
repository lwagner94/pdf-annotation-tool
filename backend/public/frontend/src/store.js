import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
    state: {
        annotations: [],
        labels: [],
        activeLabel: undefined,
    },

    mutations: {
        setAnnotations: (state, annotations) => {
            state.annotations = annotations;
        },

        storeAnnotation: (state, annotation) => {
            let index = state.annotations.findIndex(a => a.localID === annotation.localID);

            if (index > -1) {

                if (annotation.hasOwnProperty("id")) {
                    state.annotations[index].id = annotation.id;
                }
                if (annotation.hasOwnProperty("setID")) {
                    state.annotations[index].setID = annotation.setID;
                }
                state.annotations[index].created = annotation.created;
                state.annotations[index].dirty = annotation.dirty;
                state.annotations[index].deleted = annotation.deleted;
                state.annotations[index].localID = annotation.localID;
                state.annotations[index].labelID = annotation.labelID;
                state.annotations[index].properties = annotation.properties;
                state.annotations[index].pageNumber = annotation.pageNumber;
            }
            else {
                state.annotations.push(annotation);
            }
        },

        deleteAnnotation: (state, annotation) => {
            let index = state.annotations.findIndex(a => a.localID === annotation.localID);

            if (index > -1) {
                state.annotations.splice(index, 1);
            }
        },

        setLabels: (state, labels) => {
            state.labels = labels;
        },

        setActiveLabel: (state, label) => {
            state.activeLabel = label;
        }
    },

    getters: {
        annotationsForPage: state => page => {
            return state.annotations.filter(annotation => annotation.pageNumber === page);
        },
        annotations: state => {
            return state.annotations;
        },
        labels: state => {
            return state.labels
        },
        activeLabel: state => {
            return state.activeLabel;
        },
        labelByID: state => id => {
            return state.labels.find(label => label.id === id);
        }
    },

    strict: debug,
})