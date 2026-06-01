# raphink.info

Personal blog at [raphink.info](https://raphink.info), built with Gatsby and
synced from [dev.to](https://dev.to/raphink).

# Running Your Site Locally

1. Install [Node.js and npm](https://nodejs.org/en/)

1. Install npm dependencies:

        npm install

1. (Optional) Sync the latest posts from dev.to into `src/pages/posts/`:

        DEVTO_USERNAME=raphink node scripts/fetch-devto-posts.js

   In CI this runs automatically on a daily schedule via the
   [`sync-devto`](.github/workflows/sync-devto.yml) GitHub Action, which
   commits any changes back to `master` and lets Netlify rebuild the site.

1. Starts a development server

        npm run develop

1. Browse to [http://localhost:8000/](http://localhost:8000/)
