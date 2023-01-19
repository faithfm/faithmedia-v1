# FaithMedia-V1

The "Faith FM Media Management" is a line-of-business application to help manage our media content database.

Notes:

* The application is written using the Laravel + Vue frameworks.
* The front-end is (primarily) a Vue application communicating with a Laravel API, but like many Laravel + Vue apps it is not strictly a "Single Page Application (SPA)" but rather it uses a hybrid architecture.  
  * The Vue front-end is not statically-hosted, but is dynamically served by a Laravel Blade template.
  * A few helper routes do not use Vue at all.
  * Although most of the data is sourced via axios AJAX calls to the API, some configuration and user data is injected into the front-end using window.xxx variables, that become this.$xxx variables accessible throughout the Vue app.  (This technique is similar-but-different to the Laravel technique of injecting the CSRF token by means of meta tags).
* There seems to be a lot of different ways to do authentication for Laravel+Vue apps and Laravel documentation doesn't clarify common architecture patterns very well, however the approach we have chosen to use is to allow Laravel to handle authentication in a stateful manner rather than using a stateless JWT-approach more-commonly seen for other SPA apps.  Essentially, the Vue app is only served to the user if they are logged in, and the API uses stateful session cookies to authenticate API requests.
* I'm not sure if it's the best approach, but we've implemented our javascript API requests using /api/xxx routes defined in `api.php` (instead of using 'web.php' routes).  Routes defined in `web.php` look for stateful session cookie-based authentication by-default, however routes defined in `api.php` use stateless token-based authentication by default.  We discovered however that stateful authentication can be enabled alongside stateless token-based authentication in `api.php` by using ?

## Deployment

### Config Files

Create configuration files on server (project folder):

```bash
.env
auth.json
```

### Crontab

No cronjobs required for this project

### Deploy Scripts

#### Production

> Note: Currently a github App deploy script in Laravel Forge).
> Be sure to change project path + PHP version as require.

```bash
cd /home/username/project-folder.com.au

# delete session data (force logout all users during upgrade)
find storage/framework/sessions/ -type f -delete

# use fetch + hard-resetting to allow deploy of force-pushes
git fetch origin master
git checkout -f master
git reset --hard origin/master

composer install --no-interaction --prefer-dist --optimize-autoloader

( flock -w 10 9 || exit 1
    echo 'Restarting FPM...'; sudo -S service php8.1-fpm reload ) 9>/tmp/fpmlock

# restart queue workers - otherwise they won't be working with latest code - see: https://medium.com/@taylorotwell/properly-deploying-queues-on-forge-5abe1eac6d1c
php artisan queue:restart

# clear laravel cache (fixed problem with job workers not being called - https://github.com/laravel/framework/issues/16476#issuecomment-476036660)
php artisan cache:clear

# UNSAFE BECAUSE WE USE SAME TABLES FOR DEV+STAGING+PRODUCTION!  -  REMOVED
# if [ -f artisan ]; then
#     php artisan migrate --force
# fi
```

#### Staging

> Note: Currently a post-receive hook on the server.
> Be sure to change project path + PHP version as require.

```bash
#!/bin/bash

cd /home/username/project-folder.com.au

# Allow the correct working tree to be detected.
#    Prevent "remote: fatal: Not a git repository: '.'" errors.
#    See: https://stackoverflow.com/questions/6394366/problem-with-git-hook-for-updating-site
unset $(git rev-parse --local-env-vars)

while read oldrev newrev ref
do
  echo "Ref $ref sucessfully received. Deploying to staging..."
  git checkout -f $newrev
  git clean -f -d
done

composer install --no-interaction --prefer-dist --optimize-autoloader

( flock -w 10 9 || exit 1
    echo 'Restarting FPM...'; sudo -S service php8.1-fpm reload ) 9>/tmp/fpmlock

# UNSAFE BECAUSE WE USE SAME TABLES FOR DEV+STAGING+PRODUCTION!  -  REMOVED
# if [ -f artisan ]; then
#     php artisan migrate --force
# fi
```

### Daemons

No Daemons (or Queue Workers) required for this project.

### Diagrams

Front-end
![Front-end](public/front-end-diagram.jpg)

Back-end
![Back-end](public/back-end-diagram.jpg)
