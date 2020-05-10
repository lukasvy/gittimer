import Vue from "vue";
import App from "./App.vue";
import {Routes} from './routes'

import VueElectron from 'vue-electron';
import VueRouter from 'vue-router';
import Transitions from 'vue2-transitions';
import "@babel/polyfill";
import 'semantic-ui-css/semantic.min.css';
// https://github.com/PeachScript/vue-infinite-loading
import InfiniteLoading from 'vue-infinite-loading';

Vue.use(Transitions);
Vue.use(VueElectron);
Vue.use(VueRouter);
Vue.use(VueRouter);
Vue.use(InfiniteLoading, {
    system: {
        throttleLimit: 150,
    }
});

const router = new VueRouter(
    {
        routes: Routes
    });


new Vue(
    {
        router: router,
        render: h => h(App)
    }).$mount("#app");