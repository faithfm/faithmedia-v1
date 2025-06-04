// Vite configuration for building and serving the Laravel + Vue application
// This file is REQUIRED for the application to work properly
// Purpose: Configures asset compilation, development server, and build process
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import path from "path";

export default defineConfig({
    // The server configuration is crucial for proper development server functionality:
    // 1. Without this configuration, you'll see a white screen because:
    //    - Laravel and Vite run on different ports/domains
    //    - WebSocket connection for Hot Module Replacement (HMR) would fail
    // 2. cors: true is needed because the Laravel app and Vite dev server are on different origins
    // 3. hmr.host must match your local domain to enable proper WebSocket connection for live updates
    server: {
        cors: true,
        hmr: {
            host: 'faithmedia-v1.test',
        },
    },
    plugins: [
        laravel({
            input: [
                'resources/sass/app.scss',
                'resources/css/tailwind-app.css',
                'resources/js/app.js',
            ],
            refresh: true,
            detectTls: 'faithmedia-v1.test',
        }),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
        vuetify({
            autoImport: true
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./resources/js/"),
        },
    },
});
