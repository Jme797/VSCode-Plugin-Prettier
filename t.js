const path = require('path');
const prettier = require('prettier');

(async () => {
    const ws = path.resolve("c:/Users/jordan.edelston/Documents/bromium_license_server");

    let prettierPath;

    // Check if Yarn PnP is enabled at the workspace path
    try {
        const pnp = require(path.join(ws, '.pnp.cjs'));
        prettierPath = pnp.resolveRequest('prettier', ws);
    } catch (pnpError) {
        try {
            prettierPath = require.resolve('prettier', { paths: [ws] });
        } catch (resolveError) {
            console.error('Error resolving Prettier path:', resolveError);
        }
    }

    console.log(`Resolved Prettier path: ${prettierPath}`);

    if (prettierPath) {
        const localPrettier = require(prettierPath);
        const info = await localPrettier.getSupportInfo();
        const vscodeLanguages = [];
        info.languages.forEach(lang => {
            if (lang.vscodeLanguageIds) {
                vscodeLanguages.push(...lang.vscodeLanguageIds);
            }
        });
        console.log(vscodeLanguages);
    } else {
        console.log('Prettier not found in the specified workspace.');
    }
})();
