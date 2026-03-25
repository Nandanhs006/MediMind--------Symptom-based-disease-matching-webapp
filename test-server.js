const app = require('./src/app');
const PORT = 5001;

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});

setTimeout(() => {
  console.log('Closing test server');
  process.exit(0);
}, 10000);
