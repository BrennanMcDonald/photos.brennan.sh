# S3 Photo Integration

The website now pulls photos directly from your public S3 bucket: **photo-sync-dropbox**

## How It Works

```
Dropbox → Lambda Function → S3 Bucket → Website
```

1. **Lambda syncs** photos from Dropbox to S3 (via `/lambda/index.js`)
2. **Server API** (`/server/api/photos.get.ts`) fetches the public S3 bucket listing
3. **Frontend** (`/app/pages/index.vue`) displays photos in a clean masonry grid

## S3 Bucket Details

- **Bucket Name**: `photo-sync-dropbox`
- **Region**: `us-east-1`
- **URL**: https://photo-sync-dropbox.s3.us-east-1.amazonaws.com/
- **Access**: Public (ListBucket enabled)

## Current Photos

Based on the latest bucket listing:

1. **DSC09411.jpg** (5.6 MB) - Updated: Feb 5, 2026
2. **DSC09452.jpg** (3.2 MB) - Updated: Feb 5, 2026  
3. **DSCF7823.JPG** (16.1 MB) - Updated: Feb 5, 2026

## Features

✅ **Auto-refresh** - Page checks for new photos every 5 minutes  
✅ **Smart sorting** - Most recent photos appear first (top-left)  
✅ **Lazy loading** - Images load as you scroll for better performance  
✅ **Hover effects** - Shows filename and file size on hover  
✅ **Responsive masonry** - Adapts to any screen size (1/2/3 columns)  
✅ **Error handling** - Shows friendly errors if S3 is unreachable  

## Adding New Photos

Just upload photos to your Dropbox folder! The Lambda function will automatically:

1. Detect new/modified files
2. Upload them to S3
3. Website will show them on next refresh

## Development

```bash
# Start dev server
yarn dev

# The site will pull from:
# https://photo-sync-dropbox.s3.us-east-1.amazonaws.com/
```

## API Endpoint

**GET** `/api/photos`

Returns:
```json
{
  "success": true,
  "photos": [
    {
      "key": "DSC09411.jpg",
      "url": "https://photo-sync-dropbox.s3.us-east-1.amazonaws.com/DSC09411.jpg",
      "lastModified": "2026-02-05T21:32:01.000Z",
      "size": 5827032,
      "etag": "a2c2ceeb9af00adfcb171581bf493335"
    }
  ],
  "count": 3
}
```

## S3 Bucket Policy (Public Read)

Your bucket should have a policy like:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::photo-sync-dropbox",
        "arn:aws:s3:::photo-sync-dropbox/*"
      ]
    }
  ]
}
```

## Troubleshooting

### Photos not showing?

1. Check S3 bucket is public: https://photo-sync-dropbox.s3.us-east-1.amazonaws.com/
2. Check browser console for errors
3. Manually refresh: click "Retry" button

### Lambda not syncing?

1. Check Lambda logs in CloudWatch
2. Verify Dropbox access token is valid
3. Check IAM role has S3 permissions

### CORS issues?

If you get CORS errors, add this to your S3 bucket CORS configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

## Performance

- **Server-side fetch** - Bucket listing is fetched on the server (better for SEO)
- **Client-side cache** - Photos are cached in browser
- **Auto-refresh** - Updates every 5 minutes without page reload
- **Lazy loading** - Images load progressively

## Next Steps

- [ ] Add image optimization (WebP conversion)
- [ ] Add lightbox for full-size viewing
- [ ] Add filtering/sorting options
- [ ] Add photo metadata (EXIF data)
- [ ] Add pagination for large galleries
