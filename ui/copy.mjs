import * as fs from "node:fs";

[
    '../packages/aspnetcore/wwwroot/dokie.html',
    '../packages/laravel/resources/assets/dokie.html',
].forEach(file => {
    try {
        fs.rmSync(file, {force: true});
        fs.cpSync('./dist/index.html', file, {force: true});
    } catch (e) {
        console.error(`Failed to remove file ${file}:`, e);
    }
})
