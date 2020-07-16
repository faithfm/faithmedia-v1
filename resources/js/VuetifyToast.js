//Original from https://github.com/pzs/vuetify-toast, but edited for our project in July 2020
//Additional inspiration from https://github.com/eolant/vuetify-toast-snackbar
import Vue from 'vue';
import Toast from './components/Toast.vue';
import Vuetify from 'vuetify/lib';

const colors = ['success', 'info', 'error'];

let defaultOptions = {
  text: '',
  icon: 'mdi-close',
  color: 'info',
  timeout: 0,             // timeout in milliseconds for message to automatically disappear
  top: true,
  logToConsole: true, 
  toastParentId: '',      // Toast is appended to document.body, unless a toastParentId is provided
};

let toastCmp = null;

function setDefaults(newDefaultOptions) {
  defaultOptions = { ...defaultOptions, ...newDefaultOptions}
}

function createToastCmp(options) {
  const cmp = new Vue(Toast);
  const vuetifyObj = new Vuetify();
  cmp.$vuetify = vuetifyObj.framework;

  const parent = options.toastParentId ? document.getElementById(options.toastParentId) : document.body;
  parent.appendChild(cmp.$mount().$el);
  
  return cmp;
}


function getToastCmp(options) {
  if (!toastCmp) {
    toastCmp = createToastCmp(options);
  }

  return toastCmp;
}


function show(options = {}) {
  options = { ...defaultOptions, ...options }   // combine with default options
  getToastCmp(options).show(options);
  if (options.logToConsole)
    console.log('VuetifyToast: ' + options.text);    // log message to console too
}


function close() {
  getToastCmp().close();
}


function createShorthands() {
  const shorthands = {};

  colors.forEach(color => (shorthands[color] = (text, options = {}) => show({ color, text, ...options })));

  return shorthands;
}


export default {
  show,
  close,
  getToastCmp,
  setDefaults, 
  defaultOptions,
  ...createShorthands(),
};
