import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/vue3';
import { router } from '@inertiajs/vue3';

import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as directives from 'vuetify/directives';
// Note: We're keeping the Vue Router import for now during the transition phase
// but will gradually phase it out in favor of Inertia's navigation
import vueRouter from './router';
import { vLazyLoad } from './composables/useLazyLoading';

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
      .use(vueRouter); // Still using Vue Router during transition phase
      
    // Register custom directives
    app.directive('lazy-load', vLazyLoad);

    // Make Inertia props globally accessible
    // Note: This approach is not recommended in Inertia v2
    // TODO: Refactor to use Inertia's shared data feature instead
    window.LaravelAppGlobals = props.initialPage.props.LaravelAppGlobals;

    app.mount(el);
  },
});

// Export the router instance for use in components
export { router as inertiaRouter };
