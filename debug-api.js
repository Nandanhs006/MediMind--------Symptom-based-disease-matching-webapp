const http = require('http');

function makeRequest(path, callback) {
  const req = http.get(`http://localhost:5000${path}`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`\n${path}`);
      console.log(`Status: ${res.statusCode}`);
      console.log(`Response: ${data}`);
      callback();
    });
  });
  
  req.on('error', err => {
    console.error('Error:', err.message);
    callback();
  });
}

// Test queries one by one
makeRequest('/api/symptoms?q=fever', () => {
  makeRequest('/api/symptoms?q=cough', () => {
    process.exit(0);
  });
});
