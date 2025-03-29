const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to delete a directory recursively
function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // Recursive call
        deleteFolderRecursive(curPath);
      } else {
        // Delete file
        fs.unlinkSync(curPath);
      }
    });
    
    // Delete the now-empty folder
    fs.rmdirSync(folderPath);
    console.log(`Deleted: ${folderPath}`);
  }
}

// Path to the Netlify functions build output
const netlifyFunctionsPath = path.join(__dirname, '.netlify', 'functions-internal');

console.log('Cleaning up Netlify functions cache...');

// Delete the functions build directory if it exists
if (fs.existsSync(netlifyFunctionsPath)) {
  try {
    deleteFolderRecursive(netlifyFunctionsPath);
    console.log('Successfully deleted Netlify functions cache.');
  } catch (error) {
    console.error('Error deleting Netlify functions cache:', error);
  }
} else {
  console.log('No Netlify functions cache to clean.');
}

// Install dependencies for the send-email function
console.log('Installing dependencies for the send-email function...');
try {
  execSync('cd netlify/functions/send-email && npm install', { stdio: 'inherit' });
  console.log('Dependencies installed successfully.');
} catch (error) {
  console.error('Error installing dependencies:', error);
}

console.log('Netlify functions rebuild process completed.'); 