# Everspeak Deployment Guide

## ✅ Pre-Deployment Checklist (COMPLETED)

All the following have been prepared for deployment:

- ✅ Application runs locally on port 5000
- ✅ CORS configured to accept localhost + Replit domains
- ✅ Rate limiting enabled (100 requests per minute per IP)
- ✅ All API calls use relative URLs (no hardcoded localhost)
- ✅ Production build completed successfully
- ✅ Static files correctly configured for production
- ✅ express-rate-limit security package installed

## 🚀 Deployment Steps

### 1. Access Replit Deployments

Click the **"Deploy"** button in the top-right of your Replit workspace.

### 2. Create Autoscale Deployment

Choose **"Autoscale Deployment"** (recommended for web applications).

### 3. Configure Deployment Settings

Use these exact settings:

**Basic Settings:**
- **Entry Point / Run Command**: `npm start`
- **Build Command**: `npm run build`
- **Install Command**: `npm install` (default)

**Machine Resources:**
- **CPU**: 0.5 vCPU (should be sufficient, can scale up if needed)
- **RAM**: 1 GiB (recommended minimum)
- **Max Machines**: 1-3 (can adjust based on traffic)

### 4. Configure Environment Variables

⚠️ **CRITICAL**: Add your environment variables/secrets:

1. Click **"Secrets"** or **"Environment Variables"** in the deployment settings
2. Add the following secrets:

   ```
   OPENAI_API_KEY = <your-openai-api-key>
   SESSION_SECRET = <your-session-secret>
   NODE_ENV = production
   ```

   **Note**: The `OPENAI_API_KEY` and `SESSION_SECRET` should already exist in your Replit Secrets. Make sure they're available to the deployment.

### 5. Deployment Configuration

- **Auto-Restart**: ON (recommended)
- **Visibility**: PUBLIC
- **HTTPS**: Enabled (automatic)

### 6. Launch Deployment

1. Review all settings
2. Click **"Deploy"** or **"Publish"**
3. Wait for the build process (may take 1-2 minutes)
4. Watch the deployment logs for any errors

### 7. Get Your Live URL

After successful deployment, Replit will provide you with a public URL:
- Format: `https://your-repl-name.your-username.repl.co` (or `.replit.app`)
- This URL will be accessible from anywhere

## 🧪 Testing Your Deployment

Once deployed, test all features:

### Desktop Testing
1. Open the deployment URL in your browser
2. Verify persona dropdown loads
3. Test creating/editing personas
4. Test adding memories (manual and bulk import)
5. Test the Setup Wizard
6. Test AI chat functionality
7. Test journal creation with AI reflections
8. Test Persona Booster recommendations
9. Test snapshot creation and restoration

### Mobile Testing
1. Open the deployment URL on your mobile device
2. Test voice transcription (microphone should work)
3. Test all UI interactions
4. Verify responsive layout

## 📊 Monitoring

After deployment:
- Check the **Deployment Logs** tab for any errors
- Monitor the **Metrics** tab for performance
- Watch for any CORS errors in browser console

## 🔧 Troubleshooting

### Common Issues

**CORS Errors:**
- The CORS configuration allows:
  - `localhost:3000` and `localhost:5000` (development)
  - `*.replit.dev` and `*.replit.app` (production)
- If you see CORS errors, check the deployment URL matches these patterns

**Rate Limiting:**
- Currently set to 100 requests per minute per IP
- Adjust in `server/index.ts` if needed (search for `rateLimit`)

**OpenAI API Errors:**
- Verify `OPENAI_API_KEY` is set in deployment secrets
- Check deployment logs for "OPENAI_API_KEY not found" errors

**Static Files Not Loading:**
- The production build serves from `dist/public/`
- `NODE_ENV=production` must be set in deployment environment variables

## 📝 Production Checklist

After deployment, verify:
- [ ] Homepage loads without errors
- [ ] All personas load correctly
- [ ] Memories display and can be added
- [ ] Chat with AI works (sends messages, receives responses)
- [ ] Setup Wizard completes successfully
- [ ] Voice recording works on mobile devices
- [ ] Persona Booster provides recommendations
- [ ] Journal entries create with AI reflections
- [ ] Snapshots save and restore correctly
- [ ] No console errors in browser DevTools
- [ ] HTTPS certificate is active (check for 🔒 in browser)

## 🎉 Success!

Once all features are working, your Everspeak application is live and ready to use!

Share your deployment URL and enjoy your AI-powered conversational companion system.
