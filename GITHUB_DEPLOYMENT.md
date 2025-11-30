# GitHub Pages Deployment Guide

This guide will help you deploy your journalist portfolio to GitHub Pages securely.

## Prerequisites

1. **GitHub Account**: You need a GitHub account
2. **Repository**: Create a new repository on GitHub (or use existing one)
3. **Environment Variables**: You'll need your API URLs and Firebase credentials

## Security Checklist ✅

Before deploying, ensure:
- ✅ `.env` file is in `.gitignore` (already configured)
- ✅ No hardcoded secrets in code (verified - all use environment variables)
- ✅ All sensitive data will be stored in GitHub Secrets
- ✅ Firebase API keys are safe to expose (they're public keys, but restrict Firebase rules)

## Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub Repository**:
   - Go to GitHub.com
   - Click "New repository"
   - Name it: `journalist-portfolio` (or your preferred name)
   - Make it **Public** (required for free GitHub Pages)
   - **DO NOT** initialize with README, .gitignore, or license

3. **Connect Local Repository**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/journalist-portfolio.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Configure GitHub Secrets

**IMPORTANT**: Never commit your `.env` file. Instead, use GitHub Secrets.

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add each of these:

   **Required Secrets:**
   - `VITE_API_BASE_URL` - Your Google Apps Script Web App URL
     - Example: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`
   
   - `VITE_FIREBASE_API_KEY` - From Firebase Console
   - `VITE_FIREBASE_AUTH_DOMAIN` - From Firebase Console
   - `VITE_FIREBASE_PROJECT_ID` - From Firebase Console
   - `VITE_FIREBASE_STORAGE_BUCKET` - From Firebase Console
   - `VITE_FIREBASE_MESSAGING_SENDER_ID` - From Firebase Console
   - `VITE_FIREBASE_APP_ID` - From Firebase Console

   **Optional Secrets:**
   - `VITE_SITE_NAME` - Your site name (default: "Journalist Portfolio")
   - `VITE_SITE_URL` - Your GitHub Pages URL
     - Example: `https://YOUR_USERNAME.github.io/journalist-portfolio`

### Step 3: Enable GitHub Pages

1. Go to **Settings** → **Pages**
2. Under **Source**, select:
   - **Source**: `GitHub Actions`
3. Save the settings

### Step 4: Deploy

The deployment will happen automatically when you:
- Push to `main` or `master` branch
- Or manually trigger it from **Actions** tab → **Deploy to GitHub Pages** → **Run workflow**

### Step 5: Verify Deployment

1. Wait for the workflow to complete (check **Actions** tab)
2. Your site will be available at:
   ```
   https://YOUR_USERNAME.github.io/journalist-portfolio
   ```
3. Test all functionality:
   - ✅ Home page loads
   - ✅ Blog posts display
   - ✅ Admin login works
   - ✅ File uploads work (Firebase)

## Manual Deployment (Alternative)

If you prefer manual deployment instead of GitHub Actions:

1. **Build locally**:
   ```bash
   npm run build
   ```

2. **Install gh-pages** (if not already installed):
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

   This will push the `dist` folder to the `gh-pages` branch.

4. **Enable GitHub Pages**:
   - Go to **Settings** → **Pages**
   - Select **Source**: `gh-pages` branch
   - Select **Folder**: `/ (root)`

## Troubleshooting

### Issue: 404 Error on Routes
**Solution**: The base path is already configured in `vite.config.js` and `App.jsx` for `/journalist-portfolio/`

### Issue: Environment Variables Not Working
**Solution**: 
- Check GitHub Secrets are set correctly
- Ensure secret names match exactly (case-sensitive)
- Re-run the workflow after adding secrets

### Issue: Firebase Errors
**Solution**:
- Verify Firebase credentials in GitHub Secrets
- Check Firebase Storage rules allow public read access
- Ensure Firebase project is active

### Issue: API Not Working
**Solution**:
- Verify `VITE_API_BASE_URL` in GitHub Secrets
- Check Google Apps Script deployment is active
- Ensure CORS is configured in Google Apps Script

## Security Best Practices

1. **Never commit `.env` file** ✅ (already in `.gitignore`)
2. **Use GitHub Secrets** for all sensitive data ✅
3. **Review Firebase Security Rules**:
   - Go to Firebase Console → Storage → Rules
   - Ensure rules are appropriate for your use case
4. **Monitor GitHub Actions**:
   - Check Actions tab regularly
   - Review logs for any exposed secrets
5. **Rotate Secrets** if compromised:
   - Update GitHub Secrets
   - Re-run deployment workflow

## Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file in `public/` folder with your domain:
   ```
   yourdomain.com
   ```

2. Update DNS records:
   - Add CNAME record pointing to `YOUR_USERNAME.github.io`

3. Update GitHub Pages settings:
   - Go to **Settings** → **Pages**
   - Enter your custom domain

4. Update `VITE_SITE_URL` in GitHub Secrets to your custom domain

## Post-Deployment Checklist

- [ ] Site loads at GitHub Pages URL
- [ ] All pages are accessible
- [ ] Admin login works
- [ ] Blog posts display correctly
- [ ] File uploads work
- [ ] No console errors
- [ ] Mobile responsive design works
- [ ] Dark mode works
- [ ] All links work correctly

## Support

If you encounter issues:
1. Check GitHub Actions logs
2. Verify all secrets are set correctly
3. Check browser console for errors
4. Verify Google Apps Script is deployed and active

---

**Remember**: Your `.env` file should NEVER be committed to Git. All sensitive data should be in GitHub Secrets only.

