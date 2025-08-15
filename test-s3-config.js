// Quick S3 configuration test
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

// Test multiple regions to find the correct one
const regions = ['us-east-1', 'ap-south-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'];

async function testRegion(region) {
  const client = new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });
  
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 1
    });
    
    await client.send(command);
    return { region, success: true };
  } catch (error) {
    return { region, success: false, error: error.message };
  }
}

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';

async function testS3Config() {
  console.log('🧪 Testing S3 Configuration...');
  console.log('Bucket:', BUCKET_NAME);
  console.log('Access Key ID:', process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Missing');
  console.log('Secret Access Key:', process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Missing');
  
  if (!BUCKET_NAME || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.log('❌ S3 credentials incomplete');
    return false;
  }

  console.log('\n🔍 Testing different regions to locate bucket...');
  for (const region of regions) {
    console.log(`Testing region: ${region}`);
    const result = await testRegion(region);
    
    if (result.success) {
      console.log(`✅ Bucket found in region: ${region}`);
      return { success: true, correctRegion: region };
    } else {
      console.log(`❌ Failed in ${region}: ${result.error.substring(0, 100)}...`);
    }
  }
  
  console.log('❌ Bucket not found in any tested region');
  return { success: false };
}

testS3Config().then(result => {
  if (result.success) {
    console.log('\n📊 S3 Configuration Status: WORKING');
    console.log(`🔧 Correct region: ${result.correctRegion}`);
    console.log(`💡 Update your AWS_REGION environment variable to: ${result.correctRegion}`);
  } else {
    console.log('\n📊 S3 Configuration Status: FAILED');
  }
  process.exit(result.success ? 0 : 1);
});