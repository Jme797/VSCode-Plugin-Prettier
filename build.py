import json
import subprocess
from pathlib import Path
import os

# Set the VSCE_TESTS environment variable
os.environ['VSCE_TESTS'] = 'true'

# Path to the package.json file
script_dir = Path(__file__).resolve().parent
package_json_path = script_dir / 'package.json'

# Read the package.json file
with package_json_path.open('r') as file:
    package_json = json.load(file)

# Bump the minor version number
version_parts = package_json['version'].split('.')
version_parts[2] = str(int(version_parts[2]) + 1)
package_json['version'] = '.'.join(version_parts)

# Write the updated package.json file
with package_json_path.open('w') as file:
    json.dump(package_json, file, indent=2)

# Full path to the vsce executable
vsce_path = Path('C:/Program Files/nodejs/vsce.cmd')

# Run the vsce package command
subprocess.run([vsce_path, 'package', '--allow-missing-repository'], check=True)

print(f"Packaged version {package_json['version']} of the extension.")
