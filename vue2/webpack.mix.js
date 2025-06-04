const mix = require('laravel-mix');
/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.setPublicPath('../public/vue2')
    .js('resources/js/app.js', 'js')
    .js('resources/js/media_app.js', 'js')
   .sass('resources/sass/app.scss', 'css')
   .sourceMaps().vue();

if (mix.inProduction()) {
    mix.version();
}
