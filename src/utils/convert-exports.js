

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '../../');
// Path to the specific file to convert
const filePath = path.join(projectRoot, 'dist/cjs/index.js');

// Function to convert `exports.default =` to `module.exports =`
function convertExports(filePath) {
  // Read the file contents
  const fileContent = fs.readFileSync(filePath, 'utf8');

  // Check if the file contains `exports.default =`
  if (fileContent.includes('exports.default =')) {
    // Replace `exports.default =` with `module.exports =`
    const updatedContent = fileContent.replace(
      /exports\.default\s*=\s*/g,
      'module.exports = '
    );

    // Write the updated content back to the file
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Updated file: ${filePath}`);
  } else {
    console.log(`No conversion needed for file: ${filePath}`);
  }
}

// Convert the specific file
convertExports(filePath);
