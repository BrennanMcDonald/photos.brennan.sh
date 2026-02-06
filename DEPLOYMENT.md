# GitHub Pages Deployment Guide

This site is configured for static deployment to GitHub Pages.

## 🚀 Quick Setup

### 1. Update Base URL

Edit `nuxt.config.ts` and change the `baseURL` to match your repository name:

```typescript
app: {
  baseURL: '/your-repo-name/', // e.g., '/photos.brennan.sh/'
}
```

**Important**: 
- If deploying to `username.github.io`, use `baseURL: '/'`
- If deploying to `username.github.io/repo-name`, use `baseURL: '/repo-name/'`

### 2. Enable GitHub Pages

1. Go to your GitHub repository
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions** (NOT "Deploy from a branch")

**Important**: If you see an error about "Invalid deployment branch", make sure you selected "GitHub Actions" as the source, not a branch.

### 3. Push to Main Branch

The GitHub Actions workflow will automatically:
- Build the static site
- Deploy to GitHub Pages
- Make it available at your custom domain or GitHub Pages URL

## 📦 What's Configured

### Static Site Generation (SSG)

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: false,  // Client-side only (SPA mode)
  // ... other config
})
```

### No Server Code

All API calls are made directly from the browser to your S3 bucket:
- ✅ Client-side S3 fetching (`useS3Photos` composable)
- ✅ No server API routes
- ✅ No backend dependencies
- ✅ Fully static HTML/CSS/JS

## 🔧 GitHub Actions Workflow

Location: `.github/workflows/deploy.yml`

**Triggers:**
- Push to `main` branch
- Manual trigger from Actions tab

**Steps:**
1. Checkout code
2. Setup Node.js 20
3. Install dependencies with Yarn
4. Generate static site (`yarn generate`)
5. Deploy to GitHub Pages

## 🌐 Custom Domain (Optional)

### Using Custom Domain

1. Add a `CNAME` file to `/public/` directory:
   ```
   photos.brennan.sh
   ```

2. Update your DNS records:
   - **Type**: CNAME
   - **Name**: photos (or @)
   - **Value**: username.github.io

3. In GitHub Settings → Pages:
   - Enter your custom domain
   - Enable "Enforce HTTPS"

4. Update `nuxt.config.ts`:
   ```typescript
   app: {
     baseURL: '/', // Use root for custom domain
   }
   ```

## 📁 Build Output

The workflow generates static files in `.output/public/`:

```
.output/public/
├── index.html
├── assets/
│   ├── *.css
│   └── *.js
├── _nuxt/
└── .nojekyll (prevents Jekyll processing)
```

## 🧪 Local Testing

Test the production build locally:

```bash
# Generate static files
yarn generate

# Preview the production build
yarn preview

# Or serve with a static server
npx serve .output/public
```

Visit `http://localhost:3000` to test.

## ✅ Deployment Checklist

Before deploying:

- [ ] Update `baseURL` in `nuxt.config.ts`
- [ ] Verify S3 bucket URL in `useS3Photos.ts`
- [ ] Test locally with `yarn generate && yarn preview`
- [ ] Push to GitHub
- [ ] Enable GitHub Pages in repository settings
- [ ] Wait for Actions workflow to complete
- [ ] Visit your site!

## 🐛 Troubleshooting

### Error: "Invalid deployment branch"

**Full error**: `Invalid deployment branch and no branch protection rules set in the environment. Deployments are only allowed from gh-pages`

**Cause**: GitHub Pages is configured to deploy from a branch (gh-pages) but the workflow is trying to use GitHub Actions deployment.

**Solution - Option A (Recommended)**: Change to GitHub Actions deployment

1. Go to **Settings** → **Pages**
2. Under **Build and deployment** → **Source**
3. Select **"GitHub Actions"** from the dropdown
4. Save and re-run the failed workflow

**Solution - Option B**: Use the gh-pages branch workflow

1. Delete or disable `.github/workflows/deploy.yml`
2. Use `.github/workflows/deploy-gh-pages.yml` instead
3. In **Settings** → **Pages** → **Source**
4. Select **"Deploy from a branch"**
5. Choose **gh-pages** branch and **/ (root)**
6. Push to trigger deployment

See `.github/workflows/README.md` for detailed workflow information.

### Site shows 404

**Problem**: Assets not loading, base URL incorrect

**Solution**: 
- Check `baseURL` in `nuxt.config.ts`
- For repo `username.github.io/repo-name`, use `baseURL: '/repo-name/'`
- For custom domain or username.github.io, use `baseURL: '/'`

### CSS/JS not loading

**Problem**: Assets returning 404

**Solution**:
1. Verify build completed successfully in Actions tab
2. Check browser console for errors
3. Verify `buildAssetsDir` is set to `'assets'`

### Photos not loading

**Problem**: CORS or S3 bucket access issues

**Solution**:
1. Verify S3 bucket is public
2. Check S3 CORS configuration allows GET requests
3. Test bucket URL directly: https://photo-sync-dropbox.s3.us-east-1.amazonaws.com/

### Workflow fails

**Problem**: GitHub Actions build error

**Solution**:
1. Check Actions tab for error logs
2. Verify `package.json` dependencies are correct
3. Ensure `yarn.lock` is committed
4. Try running `yarn generate` locally first

## 🔄 Updating the Site

Every push to `main` automatically triggers a new deployment:

```bash
git add .
git commit -m "Update photos"
git push origin main
```

The site will be live in ~2-3 minutes.

## 📊 Performance

Static site benefits:
- ⚡ **Fast**: Pre-rendered HTML, no server processing
- 💰 **Free**: GitHub Pages hosting is free
- 🔒 **Secure**: No server to hack
- 📈 **Scalable**: CDN-backed delivery
- 🌍 **Global**: Served from GitHub's edge network

## 🔐 Security Notes

Since this is a static site:
- ✅ No backend to secure
- ✅ No database to protect
- ✅ No server-side secrets
- ⚠️ S3 bucket must be public
- ⚠️ All code is visible in browser

## 📝 Environment Variables

No environment variables needed! Everything is hardcoded for static deployment:

- S3 bucket URL is in `useS3Photos.ts`
- Base URL is in `nuxt.config.ts`

## 🎨 Customization

### Change S3 Bucket

Edit `app/composables/useS3Photos.ts`:

```typescript
const s3BucketUrl = 'https://your-bucket.s3.region.amazonaws.com/'
```

### Styling

All styles are in:
- `app/app.css` - Global styles
- `tailwind.config.ts` - Tailwind configuration
- Component `<style>` blocks

## 📚 Additional Resources

- [Nuxt Static Deployment](https://nuxt.com/docs/getting-started/deployment#static-hosting)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 🎉 Success!

Once deployed, your site will be available at:
- GitHub Pages: `https://username.github.io/repo-name/`
- Custom domain: `https://photos.brennan.sh/`

Enjoy your photography portfolio! 📸
