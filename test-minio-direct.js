require('dotenv').config();
const fs = require('fs');

// Show all MINIO-related env vars
const relevant = {};
for (const [k, v] of Object.entries(process.env)) {
  if (k.includes('MINIO')) {
    relevant[k] = v;
  }
}

console.log('All MINIO env vars:');
console.log(JSON.stringify(relevant, null, 2));

console.log('\nMINIO_USER (docker root user):', process.env.MINIO_USER);
console.log('MINIO_PASS (docker root pass):', process.env.MINIO_PASS);
console.log('MINIO_ACCESS_KEY (node app key):', process.env.MINIO_ACCESS_KEY);
console.log('MINIO_SECRET_KEY (node app secret):', process.env.MINIO_SECRET_KEY);
console.log('MINIO_ENDPOINT:', process.env.MINIO_ENDPOINT);

// Check if they match
if (process.env.MINIO_USER && process.env.MINIO_ACCESS_KEY) {
  console.log('\nAccess key matches root user?', process.env.MINIO_USER === process.env.MINIO_ACCESS_KEY);
}
if (process.env.MINIO_PASS && process.env.MINIO_SECRET_KEY) {
  console.log('Secret key matches root pass?', process.env.MINIO_PASS === process.env.MINIO_SECRET_KEY);
}
