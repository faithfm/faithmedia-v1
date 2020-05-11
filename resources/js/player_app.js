/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

require('./bootstrap');
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.css';
import Player from './components/Player.vue';
import {Howl, Howler} from 'howler';
import VueRouter from 'vue-router';
import routes from './routes';

window.Vue = require('vue');
window.Vue.use(Vuetify);
window.Vue.use(VueRouter);

/**
 * The following block of code may be used to automatically register your
 * Vue components. It will recursively scan this directory for the Vue
 * components and automatically register them with their "basename".
 *
 * Eg. ./components/ExampleComponent.vue -> <example-component></example-component>
 */

// const files = require.context('./', true, /\.vue$/i)
// files.keys().map(key => Vue.component(key.split('/').pop().split('.')[0], files(key).default))

Vue.component('example-component', require('./components/ExampleComponent.vue').default);


Vue.filter('numbers', (value) => {
    let number = value + 1
    if (number < 10) {
      return "0" + number + "."
    } 
    return number + "."
  })
  
  Vue.filter('minutes', (value) => {
    if (!value || typeof value !== "number") return "00:00"
    let min = parseInt(value / 60),
        sec = parseInt(value % 60)
    min = min < 10 ? "0" + min : min
    sec = sec < 10 ? "0" + sec : sec
    value = min + ":" + sec
    return value
  })

/**
 * Next, we will create a fresh Vue application instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

 // Pass window.XXX variables into our Vue model.  (These are defined by our Laravel Blade template)
Vue.prototype.$user = window.user;        
Vue.prototype.$config = window.config;

const app = new Vue({
    el: '#app',
    vuetify: new Vuetify({
      theme: {
        //dark: true,
      },
    }),
    render: h => h(Player),
    router: new VueRouter(routes)
});

