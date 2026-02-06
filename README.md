# Photography Portfolio

A clean, modern photography portfolio website built with Nuxt 3. Features a responsive masonry gallery with fullscreen lightbox, zoom, and pan capabilities. Pulls photos directly from AWS S3.

## ✨ Features

- 🎨 **Clean Design** - Minimal UI that focuses on the photos
- 📸 **Masonry Gallery** - Responsive grid that adapts to any screen size
- 🔍 **Fullscreen Lightbox** - Zoom up to 500%, pan with mouse/touch
- ⌨️ **Keyboard Navigation** - Arrow keys, +/-, ESC shortcuts
- 📱 **Mobile Friendly** - Touch gestures for zoom and pan
- ☁️ **S3 Integration** - Automatically fetches photos from AWS S3
- 🚀 **Static Site** - No server required, deploys to GitHub Pages
- ⚡ **Fast Loading** - Lazy loading and optimized assets

## 🏗️ Architecture

```
Dropbox → Lambda Sync → S3 Bucket → Static Website
```

1. **Lambda Function** (`/lambda/`) - Syncs photos from Dropbox to S3
2. **Static Site** - Fetches and displays photos from public S3 bucket
3. **GitHub Pages** - Hosts the static site

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Yarn (or npm)

### Installation

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

Visit `http://localhost:3000`

## 🌐 Deployment

This site is configured for automatic deployment to GitHub Pages.

### Setup

1. **Update base URL** in `nuxt.config.ts`:
   ```typescript
   app: {
     baseURL: '/your-repo-name/',
   }
   ```

2. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Source: GitHub Actions

3. **Push to main branch**:
   ```bash
   git push origin main
   ```

The site will automatically build and deploy!

📖 See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 📂 Project Structure

```
.
├── app/
│   ├── components/
│   │   └── ImageLightbox.vue      # Fullscreen zoom/pan lightbox
│   ├── composables/
│   │   └── useS3Photos.ts         # S3 bucket fetching logic
│   ├── pages/
│   │   └── index.vue              # Main gallery page
│   └── app.css                    # Global styles
├── lambda/
│   ├── index.js                   # Dropbox→S3 sync function
│   ├── deploy.sh                  # Deployment script
│   └── README.md                  # Lambda documentation
├── .github/workflows/
│   └── deploy.yml                 # GitHub Actions deployment
├── public/
│   └── .nojekyll                  # GitHub Pages configuration
└── nuxt.config.ts                 # Nuxt configuration (SSR disabled)
```

## 🔧 Configuration

### Change S3 Bucket

Edit `app/composables/useS3Photos.ts`:

```typescript
const s3BucketUrl = 'https://your-bucket.s3.region.amazonaws.com/'
```

### Styling

- **Tailwind Config**: `tailwind.config.ts`
- **Global CSS**: `app/app.css`
- **Component Styles**: Individual `<style>` blocks

## 📸 Lambda Sync Setup

The Lambda function syncs photos from Dropbox to S3.

### Setup

```bash
cd lambda
npm install
./deploy.sh
```

Set environment variables in Lambda:
- `DROPBOX_ACCESS_TOKEN`
- `DROPBOX_PATH`
- `S3_BUCKET`
- `S3_PREFIX`

📖 See [lambda/README.md](./lambda/README.md) for details.

## 🎨 Lightbox Features

### Controls

- **Mouse Wheel** - Zoom in/out
- **Click & Drag** - Pan when zoomed
- **Arrow Keys** - Navigate photos
- **+/-** - Zoom
- **0** - Reset zoom
- **ESC** - Close

### Mobile

- **Tap** - Open/close
- **Pinch** - Zoom
- **Drag** - Pan

## 🛠️ Development

```bash
# Install dependencies
yarn install

# Start dev server (http://localhost:3000)
yarn dev

# Build for production
yarn build

# Generate static site
yarn generate

# Preview production build
yarn preview

# Lint code
yarn lint
```

## 📦 Build Output

```bash
# Generate static files
yarn generate
```

Output: `.output/public/` (ready for static hosting)

## 🌍 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 License

MIT

## 🙏 Acknowledgments

Built with:
- [Nuxt 3](https://nuxt.com/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Nuxt UI](https://ui.nuxt.com/)
- [AWS S3](https://aws.amazon.com/s3/)
- [GitHub Pages](https://pages.github.com/)

## 📚 Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - GitHub Pages deployment guide
- [LIGHTBOX-FEATURES.md](./LIGHTBOX-FEATURES.md) - Lightbox controls reference
- [S3-INTEGRATION.md](./S3-INTEGRATION.md) - S3 bucket integration details
- [lambda/README.md](./lambda/README.md) - Lambda function documentation

---

Made with ❤️ by Brennan
