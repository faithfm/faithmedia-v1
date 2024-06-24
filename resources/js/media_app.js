/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

import vuetify from './vuetify';    // import and use vuetify
import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes';
import "./minutes_filter";          // global filter: "minutes".  Given: "62 | minutes" --> Output: "01:02"
import { Howl, Howler } from 'howler';
window._ = require('lodash');       // need to manually include lodash if we don't include bootstrap

import Vue from 'vue';
window.Vue = Vue;
Vue.use(VueRouter);

/**
 * The following block of code may be used to automatically register your
 * Vue components. It will recursively scan this directory for the Vue
 * components and automatically register them with their "basename".
 *
 * Eg. ./components/ExampleComponent.vue -> <example-component></example-component>
 */

const files = require.context('./', true, /\.vue$/i)
files.keys().map(key => Vue.component(key.split('/').pop().split('.')[0], files(key).default))

/**
 * Next, we will create a fresh Vue application instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

const app = new Vue({
    el: '#app',
    vuetify,
    router: new VueRouter(routes)
});

