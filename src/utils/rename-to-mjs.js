const fs = require('fs');
const path = require('path');

// Get the project root directory
const projectRoot = path.resolve(__dirname, '../../');

// Define the paths relative to the project root
const oldFilePath = path.join(projectRoot, 'dist/mjs/index.js');
const newFilePath = path.join(projectRoot, 'dist/mjs/index.mjs');
// Check if index.js exists and rename it to index.mjs
if (fs.existsSync(oldFilePath)) {
  fs.renameSync(oldFilePath, newFilePath);
  console.log('Renamed index.js to index.mjs');
} else {
  console.error(`${__dirname}/dist/mjs/index.js not found in dist/mjs`);
}
