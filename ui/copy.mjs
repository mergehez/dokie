import * as fs from "node:fs";

[
    '../aspnetcore/wwwroot/dokie.html',
    '../demo/public/dokie.html',
    '../laravel/resources/assets/dokie.html',
].forEach(file => {
    try {
        fs.rmSync(file, {force: true});
        fs.cpSync('./dist/index.html', file, {force: true});
    } catch (e) {
        console.error(`Failed to remove file ${file}:`, e);
    }
})
