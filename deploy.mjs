#!/usr/bin/env node

import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const rl = readline.createInterface({ input, output });
const ROOT = import.meta.dirname;

function run(cmd, opts = {}) {
    console.log(`\n> ${cmd}`);
    execSync(cmd, { cwd: ROOT, stdio: 'inherit', ...opts });
}

function readJSON(file) {
    return JSON.parse(readFileSync(file, 'utf-8'));
}

function writeJSON(file, data) {
    writeFileSync(file, JSON.stringify(data, null, 4) + '\n');
}

async function ask(question) {
    const answer = await rl.question(question);
    return answer.trim();
}

async function main() {
    console.log('=== Dokie Deploy Script ===\n');

    // --- Step 1: Choose package ---
    const pkg = await ask('Which package to deploy? (laravel / asp.net core / node): ');
    const pkgKey = pkg.toLowerCase().replace(/[^a-z]/g, '');

    if (!['laravel', 'aspnetcore', 'node'].includes(pkgKey)) {
        console.error(`Unknown package: "${pkg}"`);
        rl.close();
        process.exit(1);
    }

    // --- Step 2: UI build check ---
    const uiBuilt = await ask('Was the UI project built? (y/N): ');
    if (uiBuilt.toLowerCase() !== 'y' && uiBuilt.toLowerCase() !== 'yes') {
        console.log('\n--- Building UI ---');
        run('bun run build', { cwd: resolve(ROOT, 'ui') });
    }

    // --- Step 3: Execute deploy steps ---
    if (pkgKey === 'laravel') {
        await deployLaravel();
    } else if (pkgKey === 'aspnetcore') {
        await deployAspNetCore();
    } else if (pkgKey === 'node') {
        await deployNode();
    }

    console.log('\n=== Deploy complete! ===');
    rl.close();
}

async function deployLaravel() {
    const laravelDir = resolve(ROOT, 'packages/laravel');
    const currentVersion = readJSON(resolve(laravelDir, 'composer.json')).version;
    console.log(`\nCurrent version: ${currentVersion}`);

    const version = await ask('New version (e.g. 0.2.0): ');

    console.log('\n--- Updating composer.json version ---');
    const composer = readJSON(resolve(laravelDir, 'composer.json'));
    composer.version = version;
    writeJSON(resolve(laravelDir, 'composer.json'), composer);

    console.log('\n--- Committing and pushing changes ---');
    run(`cd packages/laravel && git add -A && git commit -m "v${version}" && git push origin main`);

    console.log('\n--- Creating and pushing tag ---');
    run(`cd packages/laravel && git tag "v${version}" && git push origin --tags`);
}

async function deployAspNetCore() {
    const csprojPath = resolve(ROOT, 'packages/aspnetcore/Dokie.csproj');
    let csproj = readFileSync(csprojPath, 'utf-8');

    const match = csproj.match(/<Version>(.*?)<\/Version>/);
    if (!match) {
        console.error('Could not find <Version> in .csproj');
        rl.close();
        process.exit(1);
    }
    console.log(`\nCurrent version: ${match[1]}`);

    const version = await ask('New version (e.g. 0.2.0): ');

    console.log('\n--- Updating .csproj version ---');
    csproj = csproj.replace(/<Version>.*?<\/Version>/, `<Version>${version}</Version>`);
    writeFileSync(csprojPath, csproj, 'utf-8');

    console.log('\n--- Building and packing ---');
    run('dotnet build -c Release && dotnet pack -c Release', { cwd: resolve(ROOT, 'packages/aspnetcore') });

    console.log(`\n--- Next step ---`);
    console.log(`Upload the generated .nupkg file to nuget.org:`);
    console.log(`  ${resolve(ROOT, 'packages/aspnetcore/bin/Release')}/`);
}

async function deployNode() {
    const nodeDir = resolve(ROOT, 'packages/node');
    const pkgPath = resolve(nodeDir, 'package.json');
    const pkg = readJSON(pkgPath);
    console.log(`\nCurrent version: ${pkg.version}`);

    const version = await ask('New version (e.g. 0.2.0): ');

    console.log('\n--- Updating package.json version ---');
    pkg.version = version;
    writeJSON(pkgPath, pkg);

    console.log('\n--- Installing, building, and publishing ---');
    try {
        run('cd packages/node && bun install && bun run build && npm publish --access public');
    } catch (err) {
        console.log('\n--- npm publish failed; trying login ---');
        run('npm login && npm whoami');
        run('cd packages/node && npm publish --access public');
    }
}

main().catch((err) => {
    console.error(err);
    rl.close();
    process.exit(1);
});
