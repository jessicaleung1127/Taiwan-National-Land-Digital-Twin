# Sharing And Deployment

The interactive prototype is a static website. It can be shared through GitHub Pages, Netlify, Vercel, or any ordinary static file host.

## Share A Scenario

The UI stores the current scenario in the URL hash.

1. Open the prototype.
2. Change location, waste quantities, optimization weights, or circular/traditional mode.
3. Click `Copy Link`.
4. Send the copied URL to another person.

When the recipient opens that URL, the same scenario is restored in their browser.

## Export A Scenario

Click `Export` to download the current scenario as JSON. This is useful for attaching a scenario to research notes, thesis drafts, or GitHub issues.

## GitHub Pages

After pushing the repo to GitHub:

1. Open the repository on GitHub.
2. Go to `Settings` -> `Pages`.
3. Under `Build and deployment`, choose `Deploy from a branch`.
4. Select the branch, usually `main`.
5. Select `/ (root)` as the folder.
6. Save.

The site will be available at a URL like:

```text
https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
```

The root page redirects to `app/`, where the interactive prototype lives.

## Data Caveat

The current facility records are prototype fixtures. Keep the UI shareable while replacing the seed data with official Taiwan facility and GIS sources.

