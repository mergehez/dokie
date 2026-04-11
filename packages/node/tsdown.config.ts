// @ts-ignore
import { defineConfig } from 'tsdown';

const config = defineConfig({
    clean: true,
    dts: true,
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    platform: 'node',
    shims: true,
    target: 'node18',
    deps: {
        onlyBundle: false,
        // alwaysBundle: [],
    },
});

export default config;
