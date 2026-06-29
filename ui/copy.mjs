import * as fs from 'node:fs';

['../packages/aspnetcore/wwwroot/dokie.html', '../packages/laravel/resources/assets/dokie.html', '../packages/node/assets/dokie.html'].forEach((file) => {
    try {
        fs.rmSync(file, { force: true });
        // fs.rmdirSync(path.dirname(file), {recursive: true});
        fs.cpSync('./dist/index.html', file, { force: true });
        // fs.cpSync('./dist/assets', path.dirname(file) + '/assets', {recursive: true, force: true});
        console.log(`Copied index.html to ${file}`);
    } catch (e) {
        console.error(`Failed to remove file ${file}:`, e);
    }
});
