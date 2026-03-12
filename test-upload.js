const FormData = require('form-data');
const fs = require('fs');
const http = require('http');

const form = new FormData();
form.append('file', fs.createReadStream('./package.json'));
form.append('parent', 'my-drive');

const request = http.request({
  method: 'post',
  host: 'localhost',
  port: 4000,
  path: '/upload/file',
  headers: form.getHeaders(),
});

form.pipe(request);

request.on('response', function(res) {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, body));
});
