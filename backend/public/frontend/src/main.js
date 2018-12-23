import Vue from "vue"
import Vuex from "vuex"

import App from "./App.vue"

import router from "./router"
import store from "./store"

import BootstrapVue from 'bootstrap-vue'


import { library } from '@fortawesome/fontawesome-svg-core'
import { faSearchPlus, faSearchMinus, faExpand, faCompress, faChevronLeft, faEye, faFileImport, faFileExport, faPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faSearchPlus, faSearchMinus, faExpand, faCompress, faChevronLeft, faEye, faFileImport, faFileExport, faPlus, faTrashAlt);

Vue.component('font-awesome-icon', FontAwesomeIcon)


import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue);
Vue.config.productionTip = false;

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount("#app");
