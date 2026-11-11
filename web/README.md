# PondLink Johor

PondLink is a student prototype for Johor fish farmers. It uses fictional sample
data only. Farmer views contain only fields marked as shared.

## Local development

```sh
npm ci
npm run dev
```

Run acceptance tests with `npm test` and create a production build with
`npm run build`.

## GitHub Pages

The site is deployed from the repository root using the workflow in
`.github/workflows/deploy.yml`. In the repository's **Settings → Pages**, set
the build and deployment source to **GitHub Actions**. A push to `main` that
changes `web/` builds and deploys the app to
<https://zahs7535.github.io/PondLink/>.
