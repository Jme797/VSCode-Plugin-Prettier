const esbuild = require('esbuild');

esbuild
    .build({
        entryPoints: ['./src/extension.ts'],
        bundle: true,
        platform: 'node',
        target: 'node14',
        outfile: 'out/extension.js',
        external: ['vscode', 'prettier'],
        sourcemap: true,
        tsconfig: './tsconfig.json',
    })
    .catch(() => process.exit(1));
