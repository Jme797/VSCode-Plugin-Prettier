const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Set the VSCE_TESTS environment variable
process.env.VSCE_TESTS = 'true';

// Path to the package.json file
const scriptDir = path.resolve(__dirname);
const packageJsonPath = path.join(scriptDir, 'package.json');

// Read the package.json file
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Bump the minor version number
const versionParts = packageJson.version.split('.');
versionParts[2] = (parseInt(versionParts[2], 10) + 1).toString();
packageJson.version = versionParts.join('.');

// Write the updated package.json file
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');

// Full path to the vsce executable
const vscePath = 'C:/Program Files/nodejs/vsce.cmd';

// Run the vsce package command
execSync(`"${vscePath}" package --allow-missing-repository`, { stdio: 'inherit' });

console.log(`Packaged version ${packageJson.version} of the extension.`);
