const { Dropbox } = require('dropbox');
const { S3Client, PutObjectCommand, HeadObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const fetch = require('node-fetch');

// Initialize clients
const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

/**
 * Lambda handler to sync files from Dropbox to S3
 * Only syncs files that are new or have been modified
 */
exports.handler = async (event) => {
  console.log('Starting Dropbox to S3 sync...');
  
  try {
    // Validate environment variables
    const dropboxAccessToken = process.env.DROPBOX_ACCESS_TOKEN;
    const dropboxPath = process.env.DROPBOX_PATH || '';
    const s3Bucket = process.env.S3_BUCKET;
    const s3Prefix = process.env.S3_PREFIX || '';
    
    if (!dropboxAccessToken) {
      throw new Error('DROPBOX_ACCESS_TOKEN environment variable is required');
    }
    if (!s3Bucket) {
      throw new Error('S3_BUCKET environment variable is required');
    }
    
    // Initialize Dropbox client
    const dbx = new Dropbox({ 
      accessToken: dropboxAccessToken,
      fetch: fetch
    });
    
    // Get all files from Dropbox folder (recursively)
    const dropboxFiles = await getAllDropboxFiles(dbx, dropboxPath);
    console.log(`Found ${dropboxFiles.length} files in Dropbox`);
    
    // Get all files currently in S3
    const s3Files = await getAllS3Files(s3Client, s3Bucket, s3Prefix);
    console.log(`Found ${s3Files.size} files in S3`);
    
    // Sync files
    const results = {
      uploaded: [],
      skipped: [],
      errors: []
    };
    
    for (const file of dropboxFiles) {
      try {
        const s3Key = s3Prefix ? `${s3Prefix}/${file.name}` : file.name;
        const shouldSync = await shouldSyncFile(file, s3Key, s3Files, s3Client, s3Bucket);
        
        if (shouldSync) {
          console.log(`Syncing: ${file.path_display} -> s3://${s3Bucket}/${s3Key}`);
          await syncFileToS3(dbx, file, s3Client, s3Bucket, s3Key);
          results.uploaded.push({
            dropboxPath: file.path_display,
            s3Key: s3Key,
            size: file.size
          });
        } else {
          console.log(`Skipping (already up to date): ${file.path_display}`);
          results.skipped.push(file.path_display);
        }
      } catch (error) {
        console.error(`Error syncing ${file.path_display}:`, error);
        results.errors.push({
          file: file.path_display,
          error: error.message
        });
      }
    }
    
    console.log(`Sync complete. Uploaded: ${results.uploaded.length}, Skipped: ${results.skipped.length}, Errors: ${results.errors.length}`);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Sync completed successfully',
        results: results
      })
    };
    
  } catch (error) {
    console.error('Sync failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Sync failed',
        error: error.message
      })
    };
  }
};

/**
 * Recursively get all files from a Dropbox folder
 */
async function getAllDropboxFiles(dbx, path) {
  const files = [];
  let hasMore = true;
  let cursor = null;
  
  try {
    // Initial list
    const response = await dbx.filesListFolder({
      path: path || '',
      recursive: true,
      include_deleted: false
    });
    
    // Collect files (not folders)
    for (const entry of response.result.entries) {
      if (entry['.tag'] === 'file') {
        files.push(entry);
      }
    }
    
    hasMore = response.result.has_more;
    cursor = response.result.cursor;
    
    // Continue if there are more files
    while (hasMore) {
      const continueResponse = await dbx.filesListFolderContinue({ cursor });
      
      for (const entry of continueResponse.result.entries) {
        if (entry['.tag'] === 'file') {
          files.push(entry);
        }
      }
      
      hasMore = continueResponse.result.has_more;
      cursor = continueResponse.result.cursor;
    }
    
  } catch (error) {
    console.error('Error listing Dropbox files:', error);
    throw error;
  }
  
  return files;
}

/**
 * Get all files from S3 bucket with given prefix
 */
async function getAllS3Files(s3Client, bucket, prefix) {
  const files = new Map(); // key -> metadata
  let continuationToken = null;
  
  try {
    do {
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken
      });
      
      const response = await s3Client.send(command);
      
      if (response.Contents) {
        for (const item of response.Contents) {
          files.set(item.Key, {
            size: item.Size,
            lastModified: item.LastModified,
            etag: item.ETag
          });
        }
      }
      
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);
    
  } catch (error) {
    console.error('Error listing S3 files:', error);
    throw error;
  }
  
  return files;
}

/**
 * Determine if a file should be synced based on modification time and size
 */
async function shouldSyncFile(dropboxFile, s3Key, s3Files, s3Client, s3Bucket) {
  // If file doesn't exist in S3, sync it
  if (!s3Files.has(s3Key)) {
    return true;
  }
  
  const s3FileInfo = s3Files.get(s3Key);
  
  // Compare sizes - if different, sync
  if (dropboxFile.size !== s3FileInfo.size) {
    return true;
  }
  
  // Compare modification times
  const dropboxModified = new Date(dropboxFile.client_modified || dropboxFile.server_modified);
  const s3Modified = new Date(s3FileInfo.lastModified);
  
  // If Dropbox file is newer, sync
  if (dropboxModified > s3Modified) {
    return true;
  }
  
  return false;
}

/**
 * Download file from Dropbox and upload to S3
 */
async function syncFileToS3(dbx, dropboxFile, s3Client, s3Bucket, s3Key) {
  try {
    // Download file from Dropbox
    const downloadResponse = await dbx.filesDownload({ path: dropboxFile.path_lower });
    const fileBuffer = downloadResponse.result.fileBinary;
    
    // Determine content type based on file extension
    const contentType = getContentType(dropboxFile.name);
    
    // Upload to S3
    const putCommand = new PutObjectCommand({
      Bucket: s3Bucket,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: contentType,
      Metadata: {
        'dropbox-path': dropboxFile.path_display,
        'dropbox-id': dropboxFile.id,
        'dropbox-modified': dropboxFile.client_modified || dropboxFile.server_modified,
        'original-size': dropboxFile.size.toString()
      }
    });
    
    await s3Client.send(putCommand);
    console.log(`Successfully uploaded ${s3Key} to S3`);
    
  } catch (error) {
    console.error(`Error syncing ${dropboxFile.path_display} to S3:`, error);
    throw error;
  }
}

/**
 * Get content type based on file extension
 */
function getContentType(filename) {
  const ext = filename.toLowerCase().split('.').pop();
  const types = {
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'heic': 'image/heic',
    'heif': 'image/heif',
    'svg': 'image/svg+xml',
    
    // Videos
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    
    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    
    // Other
    'json': 'application/json',
    'txt': 'text/plain',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript'
  };
  
  return types[ext] || 'application/octet-stream';
}
