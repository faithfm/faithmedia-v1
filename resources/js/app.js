import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/vue3';

import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as directives from 'vuetify/directives';

// Vuetify setup
const vuetify = createVuetify({
  directives,
});

// Create Inertia app
createInertiaApp({
  title: title => `${title} - FaithMedia`,
  resolve: async name => {
    const pages = import.meta.glob('./Pages/**/*.vue', { eager: true });
    const page = pages[`./Pages/${name}.vue`];

    if (!page) {
      throw new Error(`Page not found: ${name}`);
    }

    return page;
  },
  setup({ el, App, props, plugin }) {
    const app = createApp({ render: () => h(App, props) })
      .use(plugin)
      .use(vuetify)

    app.mount(el);
  },
});

