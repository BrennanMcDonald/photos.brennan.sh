# Dropbox to S3 Sync Lambda Function

This AWS Lambda function automatically syncs files from a Dropbox folder to an S3 bucket. Files are only uploaded if they're new or have been modified since the last sync.

## Features

- ✅ **Unidirectional sync** - Dropbox → S3 only
- ✅ **Incremental syncing** - Only uploads new or modified files
- ✅ **Recursive folder support** - Syncs all files in subfolders
- ✅ **Smart comparison** - Compares file size and modification time
- ✅ **Metadata preservation** - Stores Dropbox metadata in S3
- ✅ **Content type detection** - Automatically sets correct MIME types
- ✅ **Error handling** - Continues syncing even if individual files fail

## Prerequisites

1. **Dropbox Access Token**
   - Go to https://www.dropbox.com/developers/apps
   - Create a new app or use existing one
   - Generate an access token with `files.content.read` permission

2. **AWS Account**
   - S3 bucket created
   - IAM role with permissions (see below)

3. **Node.js 18.x or later** (for Lambda runtime)

## Setup Instructions

### 1. Install Dependencies

```bash
cd lambda
npm install
```

### 2. Create IAM Role for Lambda

Create an IAM role with the following policies:

**Inline Policy (S3 Access):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:HeadObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR-BUCKET-NAME",
        "arn:aws:s3:::YOUR-BUCKET-NAME/*"
      ]
    }
  ]
}
```

Also attach: `AWSLambdaBasicExecutionRole` (for CloudWatch Logs)

### 3. Package the Lambda Function

```bash
npm run package
```

This creates `function.zip` ready for upload.

### 4. Deploy to AWS Lambda

#### Option A: AWS Console

1. Go to AWS Lambda Console
2. Create new function
3. Runtime: Node.js 18.x
4. Upload `function.zip`
5. Set handler to `index.handler`
6. Configure environment variables (see below)
7. Set timeout to at least 5 minutes (for large syncs)
8. Set memory to at least 512 MB

#### Option B: AWS CLI

```bash
aws lambda create-function \
  --function-name dropbox-s3-sync \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR-ACCOUNT-ID:role/YOUR-LAMBDA-ROLE \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --timeout 300 \
  --memory-size 512 \
  --environment Variables="{DROPBOX_ACCESS_TOKEN=YOUR_TOKEN,DROPBOX_PATH=/Photos,S3_BUCKET=your-bucket,S3_PREFIX=photos}"
```

### 5. Configure Environment Variables

Set these in Lambda configuration:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DROPBOX_ACCESS_TOKEN` | ✅ Yes | Your Dropbox API access token | `sl.xxxxx...` |
| `DROPBOX_PATH` | No | Path in Dropbox to sync (default: root) | `/Photos` |
| `S3_BUCKET` | ✅ Yes | Target S3 bucket name | `my-photos-bucket` |
| `S3_PREFIX` | No | Prefix/folder in S3 (default: none) | `photos` |
| `AWS_REGION` | No | AWS region (default: us-east-1) | `us-west-2` |

### 6. Set Up Trigger (Optional)

Schedule automatic syncs using EventBridge:

1. Go to Lambda function → Configuration → Triggers
2. Add trigger → EventBridge (CloudWatch Events)
3. Create new rule:
   - **Name**: `dropbox-sync-hourly`
   - **Schedule expression**: `rate(1 hour)` or `cron(0 * * * ? *)`
4. Save

## Usage

### Manual Invocation

```bash
# Test the function
aws lambda invoke \
  --function-name dropbox-s3-sync \
  --payload '{}' \
  response.json

cat response.json
```

### Response Format

```json
{
  "statusCode": 200,
  "body": {
    "message": "Sync completed successfully",
    "results": {
      "uploaded": [
        {
          "dropboxPath": "/Photos/image1.jpg",
          "s3Key": "photos/image1.jpg",
          "size": 2048576
        }
      ],
      "skipped": ["/Photos/image2.jpg"],
      "errors": []
    }
  }
}
```

## How It Works

1. **List Dropbox Files** - Recursively lists all files in specified folder
2. **List S3 Files** - Gets all existing files in S3 bucket/prefix
3. **Compare** - For each Dropbox file:
   - Check if exists in S3
   - Compare file size
   - Compare modification time
4. **Sync** - Download from Dropbox and upload to S3 if:
   - File doesn't exist in S3
   - File size is different
   - Dropbox file is newer
5. **Metadata** - Stores Dropbox metadata in S3 object metadata:
   - Original Dropbox path
   - Dropbox file ID
   - Modification time
   - Original file size

## File Organization

Files maintain their folder structure:

```
Dropbox:
  /Photos/
    2024/
      vacation/
        IMG_001.jpg
        IMG_002.jpg

S3 (with prefix "photos"):
  photos/2024/vacation/IMG_001.jpg
  photos/2024/vacation/IMG_002.jpg
```

## Cost Optimization

- **Lambda**: Charged per invocation and execution time
- **S3**: Charged for storage and PUT requests
- **Dropbox API**: 15 requests per second limit (function respects this)

**Tip**: Set memory to 512 MB for good balance of speed and cost.

## Monitoring

View logs in CloudWatch Logs:

```bash
aws logs tail /aws/lambda/dropbox-s3-sync --follow
```

## Troubleshooting

### "DROPBOX_ACCESS_TOKEN environment variable is required"
- Set the environment variable in Lambda configuration

### "Access Denied" errors
- Check IAM role has correct S3 permissions
- Verify S3 bucket name is correct

### Timeout errors
- Increase Lambda timeout (Configuration → General → Timeout)
- For large folders, consider pagination or parallel processing

### Rate limit errors
- Dropbox has rate limits - function handles this automatically
- If persistent, add delays between files

## Development

### Local Testing

Create a `.env` file:

```bash
DROPBOX_ACCESS_TOKEN=your_token
DROPBOX_PATH=/Photos
S3_BUCKET=your-bucket
S3_PREFIX=photos
AWS_REGION=us-east-1
```

Run locally (requires AWS credentials):

```bash
node -e "require('./index').handler({}).then(console.log)"
```

## Security Notes

- ⚠️ **Never commit access tokens** to version control
- ✅ Use AWS Secrets Manager for production tokens
- ✅ Rotate Dropbox access tokens regularly
- ✅ Use least-privilege IAM policies
- ✅ Enable S3 bucket encryption

## Future Enhancements

- [ ] Support for deletions (remove files from S3 if deleted in Dropbox)
- [ ] Bidirectional sync
- [ ] Image resizing/optimization
- [ ] Notification on sync completion (SNS/Email)
- [ ] Dry-run mode
- [ ] Exclude patterns (ignore certain files/folders)

## License

MIT
