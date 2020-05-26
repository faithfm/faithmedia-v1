# faithmedia-v1

The "Faith FM Media Management" is a line-of-business application to help manage our media content database.

Notes:

* The application is written using the Laravel + Vue frameworks.
* The front-end is (primarily) a Vue application communicating with a Laravel API, but like many Laravel + Vue apps it is not strictly a "Single Page Application (SPA)" but rather it uses a hybrid architecture.  
  * The Vue front-end is not statically-hosted, but is dynamically served by a Laravel Blade template.
  * A few helper routes do not use Vue at all.
  * Although most of the data is sourced via axios AJAX calls to the API, some configuration and user data is injected into the front-end using window.xxx variables, that become this.$xxx variables accessible throughout the Vue app.  (This technique is similar-but-different to the Laravel technique of injecting the CSRF token by means of meta tags).
* There seems to be a lot of different ways to do authentication for Laravel+Vue apps and Laravel documentation doesn't clarify common architecture patterns very well, however the approach we have chosen to use is to allow Laravel to handle authentication in a stateful manner rather than using a stateless JWT-approach more-commonly seen for other SPA apps.  Essentially, the Vue app is only served to the user if they are logged in, and the API uses stateful session cookies to authenticate API requests.
* I'm not sure if it's the best approach, but we've implemented our javascript API requests using /api/xxx routes defined in `api.php` (instead of using 'web.php' routes).  Routes defined in `web.php` look for stateful session cookie-based authentication by-default, however routes defined in `api.php` use stateless token-based authentication by default.  We discovered however that stateful authentication can be enabled alongside stateless token-based authentication in `api.php` by using ??????


