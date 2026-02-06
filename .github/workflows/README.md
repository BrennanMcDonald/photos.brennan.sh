# GitHub Actions Workflows

This directory contains workflows for deploying to GitHub Pages.

## Available Workflows

### 1. `deploy.yml` - Modern GitHub Actions Deployment ✅ RECOMMENDED

**Uses**: GitHub Pages native Actions deployment
**Branch**: Deploys directly from workflow
**Setup**: Set Pages source to "GitHub Actions"

**Steps to use**:
1. Go to Settings → Pages
2. Under "Source", select **"GitHub Actions"**
3. Push to main branch
4. Done! ✅

**Pros**:
- Modern, recommended by GitHub
- No intermediate branch needed
- Better permissions model
- Native integration

---

### 2. `deploy-gh-pages.yml` - Legacy Branch Deployment

**Uses**: Pushes to `gh-pages` branch
**Branch**: Creates/updates `gh-pages` branch
**Setup**: Set Pages source to "Deploy from a branch"

**Steps to use**:
1. **Delete or disable `deploy.yml`** (to avoid conflicts)
2. Go to Settings → Pages
3. Under "Source", select **"Deploy from a branch"**
4. Choose **`gh-pages`** branch and **`/ (root)`**
5. Push to main branch
6. Done! ✅

**Pros**:
- Works with legacy Pages configuration
- More control over deployment branch
- Compatible with older setups

---

## Which One to Use?

### Use `deploy.yml` if:
✅ You want the modern, recommended approach
✅ You're setting up a new site
✅ You want simpler configuration

### Use `deploy-gh-pages.yml` if:
✅ Your Pages is already configured for branch deployment
✅ You prefer the traditional approach
✅ You need compatibility with existing workflows

---

## Switching Between Workflows

### To switch from `deploy.yml` to `deploy-gh-pages.yml`:

1. Delete (or rename) `deploy.yml`:
   ```bash
   git rm .github/workflows/deploy.yml
   # or
   mv .github/workflows/deploy.yml .github/workflows/deploy.yml.disabled
   ```

2. Update GitHub Pages settings to "Deploy from a branch" → `gh-pages`

3. Push changes

### To switch from `deploy-gh-pages.yml` to `deploy.yml`:

1. Delete (or rename) `deploy-gh-pages.yml`:
   ```bash
   git rm .github/workflows/deploy-gh-pages.yml
   # or
   mv .github/workflows/deploy-gh-pages.yml .github/workflows/deploy-gh-pages.yml.disabled
   ```

2. Update GitHub Pages settings to "GitHub Actions"

3. Push changes

---

## Troubleshooting

### Error: "Invalid deployment branch"

**Problem**: Workflow expects GitHub Actions source but Pages is set to branch deployment

**Solution**: 
- **Option A**: Change Pages source to "GitHub Actions" (Settings → Pages)
- **Option B**: Switch to `deploy-gh-pages.yml` workflow

### Both workflows running

**Problem**: Both workflow files exist and are active

**Solution**: Keep only one workflow file active:
```bash
# Keep modern approach
git rm .github/workflows/deploy-gh-pages.yml

# OR keep legacy approach
git rm .github/workflows/deploy.yml
```

### Workflow succeeds but site doesn't update

**Problem**: Wrong branch selected in Pages settings

**Solution**:
- For `deploy.yml`: Use "GitHub Actions" source
- For `deploy-gh-pages.yml`: Use "Deploy from a branch" → `gh-pages`

---

## Current Recommendation

🎯 **Use `deploy.yml` with GitHub Actions source**

This is the modern, recommended approach and provides the best experience.

To use it:
1. Keep `deploy.yml`, delete `deploy-gh-pages.yml`
2. Go to Settings → Pages → Source → **"GitHub Actions"**
3. Push to main
4. ✅ Done!
