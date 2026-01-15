# Everspeak Deployment Guide

## Overview

Everspeak is deployed to **DigitalOcean** via **GitHub Actions**. Pushing to the `main` branch automatically triggers a deployment.

**Live URL:** https://everspeak.almaseo.com
**Server IP:** 165.22.44.109
**Server Path:** /var/www/everspeak

---

## How Deployment Works

1. You push code to the `main` branch on GitHub
2. GitHub Actions workflow (`.github/workflows/deploy.yml`) triggers
3. The workflow SSHs to the DigitalOcean server as the `deploy` user
4. It runs: `git fetch origin` → `git pull origin main` → `pm2 restart everspeak`
5. Changes are live within ~30 seconds

---

## Static Files

**Important:** Static files are served from the **root `public/` folder**, NOT `dist/public/`.

- `public/index.html` - Main HTML file
- `public/app.js` - Main JavaScript
- `public/styles.css` - Stylesheets
- `public/wizardEngine.js` - Wizard functionality

When you edit files in `public/`, they are served immediately after deployment (no build step needed for static files).

---

## Server Architecture

```
/var/www/everspeak/
├── public/              ← Static files served here
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── wizardEngine.js
├── server/              ← TypeScript source
├── dist/                ← Compiled server code
│   └── index.js         ← Production server entry point
├── attached_assets/     ← Uploaded assets
└── .github/workflows/
    └── deploy.yml       ← Deployment automation
```

---

## PM2 Process

The app runs via PM2 (process manager):

```bash
pm2 list                    # View running processes
pm2 restart everspeak       # Restart the app
pm2 logs everspeak          # View logs
pm2 stop everspeak          # Stop the app
pm2 start everspeak         # Start the app
```

---

## Manual Deployment (if needed)

SSH into the server and run:

```bash
cd /var/www/everspeak
git fetch origin
git pull origin main
pm2 restart everspeak
```

---

## Important Notes

### File Permissions

The `/var/www/everspeak` directory must be owned by the `deploy` user for automated deployments to work.

If you SSH as `root` and run git commands, fix permissions afterward:

```bash
chown -R deploy:deploy /var/www/everspeak
```

### Environment Variables

Environment variables are stored in `.env` on the server (not committed to git):

- `OPENAI_API_KEY` - For AI features
- `SESSION_SECRET` - For session management
- `NODE_ENV` - Set to `production`

---

## GitHub Actions Workflow

The deploy workflow (`.github/workflows/deploy.yml`):

```yaml
name: Auto Deploy to DigitalOcean

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: 165.22.44.109
          username: deploy
          key: ${{ secrets.DO_SSH_KEY }}
          script: |
            cd /var/www/everspeak
            git fetch origin
            git pull origin main
            pm2 restart everspeak
```

**Required Secret:** `DO_SSH_KEY` - SSH private key for the `deploy` user

---

## Testing Deployment

After pushing changes:

1. Check GitHub Actions: https://github.com/ilaos/everspeak/actions
2. Wait for green checkmark (~30 seconds)
3. Refresh the live site: https://everspeak.almaseo.com
4. If changes don't appear, check troubleshooting guide
