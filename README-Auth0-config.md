# Auth0 configuration notes

Faith FM Media Management uses Auth0 for Authentication.  Configuration notes shown below...

## Document New Application:

* In auth0 Dashbord -> ***+ CREATE APPLICATION***
* Give a name to the new application and select application type: ***Regular Web Applications***
* In 'Quick Start' select ***PHP(Laravel)***
* In Settings tab
  * Configure allowed Callback URLs (add local, development and production sites):
  
  `http://faithmedia-v1.myserver.com/auth0/callback, http://faithmedia-v1-staging.myserver.com/auth0/callback, http://faithmedia-v1.test/auth0/callback`

  * Configure Allowed Logout URLs (add local, development and production sites):

  `http://faithmedia-v1.myserver.com, http://faithmedia-v1-staging.myserver.com, http://faithmedia-v1.test`

  * Configure Allowed Web origins (add local, development and production sites):

  `http://faithmedia-v1.myserver.com, http://faithmedia-v1-staging.myserver.com, http://faithmedia-v1.test`

  * Configure Allowed Origins(CORS) (add local, development and production sites):
  
  `http://faithmedia-v1.myserver.com, http://faithmedia-v1-staging.myserver.com, http://faithmedia-v1.test`

And save changes

In your code, edit the .env file to add the credential of the new Auth0 Application:

```bash
AUTH0_DOMAIN=xxxx.yy.auth0.com
AUTH0_CLIENT_ID=XXXXXXX
AUTH0_CLIENT_SECRET=XXXXXXXXXXXXXXX
```

## How to request username - additional sign-up info

By default auth0 signup only request for email and password, but sometimes is necessary to add extra fields in the sign-up form

**NOTE:** *The Universal Login is the same one for all applications*

* In Auth0 portal -> Universal Login
* Login tab -> HTML Tab

```html
<script>
...
  var lock = new Auth0Lock(config.clientID, config.auth0Domain, {
    ...  
     additionalSignUpFields: [{ // manually added to request user's name during signup
        name: "name",
        placeholder: "Enter your full name",
        storage: "root",
    }]
    });
</script>
```

* Save changes
