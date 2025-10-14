export const useUri = (url: string) => {
    let protocol = 'http';
    if (url.includes('://')) {
        protocol = url.split('://')[0]!;
        url = url.split('://')[1]!;
    }
    const hostname = url.split('/')[0]!;
    let path = url.split('/').slice(1).join('/');
    const params = {} as Record<string, string>;
    if (path.includes('?')) {
        const [pathX, query] = path.split('?');
        query!.split('&').forEach(q => {
            const [key, value] = q.split('=');
            params[key!]! = value!;
        });

        path = pathX!;
    }
    return {
        protocol,
        hostname,
        path,
        params,
        toString: () => {
            let url = `/${path}`
            if (Object.keys(params).length > 0) {
                url += '?' + Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&');
            }
            return [`${protocol}://${hostname}`.replace('///', '//'), url];
        }
    }
}