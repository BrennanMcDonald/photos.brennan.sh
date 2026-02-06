/**
 * Local testing script for the Lambda function
 * 
 * Usage:
 * 1. Create a .env file with your credentials
 * 2. Run: node test-local.js
 */

require('dotenv').config();
const { handler } = require('./index');

async function test() {
  console.log('Testing Lambda function locally...\n');
  
  // Check required environment variables
  const required = ['DROPBOX_ACCESS_TOKEN', 'S3_BUCKET'];
  const missing = required.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('\nCreate a .env file with:');
    console.error('  DROPBOX_ACCESS_TOKEN=your_token');
    console.error('  S3_BUCKET=your-bucket');
    console.error('  DROPBOX_PATH=/Photos (optional)');
    console.error('  S3_PREFIX=photos (optional)');
    process.exit(1);
  }
  
  console.log('Configuration:');
  console.log('  Dropbox Path:', process.env.DROPBOX_PATH || '(root)');
  console.log('  S3 Bucket:', process.env.S3_BUCKET);
  console.log('  S3 Prefix:', process.env.S3_PREFIX || '(none)');
  console.log();
  
  try {
    const result = await handler({});
    console.log('\n✅ Success!');
    console.log(JSON.stringify(JSON.parse(result.body), null, 2));
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

test();
