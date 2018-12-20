import Vue from "vue"
import Router from "vue-router"
import Viewer from "./views/Viewer"
import Documents from "./views/Documents";

Vue.use(Router);

const router = new Router({
    mode: "history",
    base: process.env.BASE_URL,
    routes: [
        {
            path: "/viewer",
            name: "viewer",
            component: Viewer
        },
        {
            path: "/",
            name: "documents",
            component: Documents
        }
    ]
});

export default router;