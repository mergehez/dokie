import * as fs from "node:fs";


let content = fs.readFileSync('./dist/index.html', 'utf-8')

// workaround to prevent DOMPurify code confusing browser
// the problematic code: dirty = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + dirty + "</body></html>";
content = content.replaceAll("<head></head>", " ");
fs.writeFileSync('./dist/index.html', content, 'utf-8');

[
    '../packages/aspnetcore/wwwroot/dokie.html',
    '../packages/laravel/resources/assets/dokie.html',
].forEach(file => {
    try {
        fs.rmSync(file, {force: true});
        // fs.rmdirSync(path.dirname(file), {recursive: true});
        fs.cpSync('./dist/index.html', file, {force: true});
        // fs.cpSync('./dist/assets', path.dirname(file) + '/assets', {recursive: true, force: true});
    } catch (e) {
        console.error(`Failed to remove file ${file}:`, e);
    }
})
