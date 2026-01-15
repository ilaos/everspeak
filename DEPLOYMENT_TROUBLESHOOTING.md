# Deployment Troubleshooting Guide

## Quick Diagnosis

### Check if deployment ran
Go to: https://github.com/ilaos/everspeak/actions

- **Green checkmark** = Workflow succeeded
- **Red X** = Workflow failed (click to see error)
- **Yellow dot** = Still running

---

## Common Issues & Fixes

### Issue: Changes not appearing (workflow succeeded)

**Symptoms:** GitHub Actions shows green checkmark, but site hasn't updated.

**Cause:** File permission issue - the `deploy` user can't write to git files.

**Diagnosis:** SSH into server and run:
```bash
sudo -u deploy git fetch origin
```
If you see "Permission denied", that's the problem.

**Fix:**
```bash
chown -R deploy:deploy /var/www/everspeak
```

**Why this happens:** When you SSH as `root` and run git commands, files get owned by root, locking out the `deploy` user.

---

### Issue: GitHub Actions workflow fails

**Symptoms:** Red X on the Actions page.

**Diagnosis:** Click on the failed workflow, expand "Deploy to server" step.

**Common causes:**
1. **SSH key issue** - The `DO_SSH_KEY` secret may be invalid
2. **Server unreachable** - Server might be down
3. **Git conflict** - Merge conflict on server

**Fix for git conflicts:**
```bash
ssh root@165.22.44.109
cd /var/www/everspeak
git status                    # See what's conflicting
git checkout -- <file>        # Discard local changes
git pull origin main
chown -R deploy:deploy /var/www/everspeak
pm2 restart everspeak
```

---

### Issue: Site is down / 502 error

**Symptoms:** Site shows "502 Bad Gateway" or doesn't load.

**Diagnosis:** SSH and check PM2:
```bash
pm2 list
pm2 logs everspeak --lines 50
```

**Common causes:**
1. **PM2 crashed** - Run `pm2 restart everspeak`
2. **Port conflict** - Check if another process is using the port
3. **Missing .env** - Ensure `.env` file exists on server

---

### Issue: API works but static files don't load

**Symptoms:** API endpoints work, but HTML/CSS/JS files return 404.

**Cause:** Server might be looking in wrong directory.

**Check:** The server should serve from `public/` folder. Verify in `server/index.ts`:
```javascript
const publicPath = path.join(__dirname, '..', 'public');
```

---

## Manual Deployment Steps

If automated deployment isn't working:

```bash
# SSH to server
ssh root@165.22.44.109

# Navigate to project
cd /var/www/everspeak

# Pull latest code
git fetch origin
git pull origin main

# Fix permissions (important!)
chown -R deploy:deploy /var/www/everspeak

# Restart app
pm2 restart everspeak

# Verify it's running
pm2 list
```

---

## Verifying Deployment

### Check server has latest commit:
```bash
cd /var/www/everspeak
git log --oneline -1
```
Compare the commit hash with what's on GitHub.

### Check file was updated:
```bash
head -20 public/index.html
```
Look for your recent changes.

### Check HTTP response:
```bash
curl -I https://everspeak.almaseo.com
```
Look at `Last-Modified` header to see when file was last changed.

---

## Server Access

**SSH as root:**
```bash
ssh root@165.22.44.109
```

**Server details:**
- IP: 165.22.44.109
- Project path: /var/www/everspeak
- Process manager: PM2
- Process name: everspeak

---

## Prevention

To avoid deployment issues:

1. **Don't run git commands as root** - If you must, always run `chown -R deploy:deploy /var/www/everspeak` afterward

2. **Don't edit files directly on server** - Make changes locally, push to GitHub, let automation deploy

3. **Check Actions after pushing** - Verify the workflow succeeded before assuming changes are live
