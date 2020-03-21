import Vue from "vue";
import App from "./App.vue";
import {Routes} from './routes'

import VueElectron from 'vue-electron';
import VueRouter from 'vue-router';
import Transitions from 'vue2-transitions';
import "@babel/polyfill";

Vue.use(Transitions);
Vue.use(VueElectron);
Vue.use(VueRouter);

const router = new VueRouter(
    {
        routes: Routes
    });


new Vue(
    {
        router: router,
        render: h => h(App)
    }).$mount("#app");