import fs from 'node:fs';
import path from 'node:path';

export type DokieRequestLike = {
    connection?: {
        encrypted?: boolean;
    };
    get?(name: string): string | undefined;
    header?(name: string): string | undefined;
    headers?: Record<string, string | string[] | undefined>;
    hostname?: string;
    protocol?: string;
    socket?: {
        encrypted?: boolean;
        localPort?: number;
    };
};

export type DokieResponseLike = {
    end?(chunk?: string): unknown;
    send?(body: string): unknown;
    setHeader?(name: string, value: string): unknown;
    type?(value: string): unknown;
};

export type DokieAppLike = {
    get(path: string, handler: (req: DokieRequestLike, res: DokieResponseLike) => unknown): unknown;
};

export type DokieFetchRequestLike = Request;

export type DokieOptions = {
    bodies?: Record<string, string>;
    currentHostname?: string;
    favorites?: string[];
    headers?: Record<string, string>;
    hostnames?: string[];
    openApiJsonUrl?: string;
    postscripts?: Record<string, string>;
    title?: string;
    variables?: Record<string, string>;

    assetPath?: string;
    routePath?: string;
};

const _defaultAssetPath = path.resolve(__dirname, '../assets/dokie.html');
export const _coreExports = createDokieServerExports(_defaultAssetPath, (assetPath) => fs.readFileSync(assetPath, 'utf8'));

function normalizeFetchRequest(req: DokieFetchRequestLike): DokieRequestLike {
    const url = new URL(req.url);

    return {
        get(name: string) {
            return req.headers.get(name) ?? undefined;
        },
        header(name: string) {
            return req.headers.get(name) ?? undefined;
        },
        headers: Object.fromEntries(req.headers.entries()),
        hostname: url.host,
        protocol: url.protocol.replace(/:$/, ''),
    };
}

export function forCustomServer() {
    return {
        createDokieHandler: _coreExports.createDokieHandler,
        createDokieMiddleware: _coreExports.createDokieHandler,
        getDokieAssetPath: _coreExports.getDokieAssetPath,
        registerDokieRoute: _coreExports.registerDokieRoute,
        renderDokieHtml: _coreExports.renderDokieHtml,
    };
}

export function forFetch() {
    function renderDokieHtmlForFetch(options: DokieOptions = {}, req?: DokieFetchRequestLike): string {
        return _coreExports.renderDokieHtml(options, req ? normalizeFetchRequest(req) : undefined);
    }

    function createDokieHandlerForFetch(options: DokieOptions = {}) {
        return function dokieFetchHandler(req: DokieFetchRequestLike): Response {
            const html = renderDokieHtmlForFetch(options, req);

            return new Response(html, {
                headers: {
                    'Content-Type': 'text/html; charset=utf-8',
                },
            });
        };
    }

    return {
        createDokieHandler: createDokieHandlerForFetch,
        createDokieMiddleware: createDokieHandlerForFetch,
        getDokieAssetPath: _coreExports.getDokieAssetPath,
        renderDokieHtml: renderDokieHtmlForFetch,
    };
}

function escapeHtml(value: string): string {
    return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function safeJson(value: unknown): string {
    return JSON.stringify(value).replaceAll('<', '\\u003c').replaceAll('>', '\\u003e').replaceAll('&', '\\u0026').replaceAll('\u2028', '\\u2028').replaceAll('\u2029', '\\u2029');
}

function trimTrailingSlash(value: string | undefined): string | undefined {
    return typeof value === 'string' ? value.replace(/\/+$/, '') : value;
}

function getRequestHeader(req: DokieRequestLike | undefined, name: string): string | undefined {
    if (!req) {
        return undefined;
    }

    if (typeof req.get === 'function') {
        return req.get(name);
    }

    if (typeof req.header === 'function') {
        return req.header(name);
    }

    const headers = req.headers ?? {};
    const value = headers[name.toLowerCase()] ?? headers[name];
    return Array.isArray(value) ? value[0] : value;
}

function getOpenApiJsonUrl(currentHostname: string, options: DokieOptions = {}): string {
    const configuredUrl = options.openApiJsonUrl ?? '/openapi.json';
    if (typeof configuredUrl !== 'string' || configuredUrl.length === 0) {
        return '/openapi.json';
    }

    if (/^[a-z]+:\/\//i.test(configuredUrl)) {
        return configuredUrl;
    }

    if (configuredUrl.startsWith('/') && currentHostname) {
        return `${currentHostname}${configuredUrl}`;
    }

    return configuredUrl;
}

function buildDokieConfig(options: DokieOptions = {}, req?: DokieRequestLike) {
    const getProtocol = (): string => {
        if (!req) {
            return 'http';
        }

        if (typeof req.protocol === 'string' && req.protocol.length > 0) {
            return req.protocol;
        }

        const forwardedProto = getRequestHeader(req, 'x-forwarded-proto');
        if (typeof forwardedProto === 'string' && forwardedProto.length > 0) {
            return forwardedProto.split(',')[0].trim();
        }

        if (req.socket?.encrypted || req.connection?.encrypted) {
            return 'https';
        }

        return 'http';
    };
    const currentHost = (() => {
        if (!req) {
            return undefined;
        }

        if (typeof req.hostname === 'string' && req.hostname.length > 0) {
            const port = req.socket?.localPort;
            return req.hostname.includes(':') || !port ? req.hostname : `${req.hostname}:${port}`;
        }

        const forwardedHost = getRequestHeader(req, 'x-forwarded-host');
        if (typeof forwardedHost === 'string' && forwardedHost.length > 0) {
            return forwardedHost.split(',')[0].trim();
        }

        const host = getRequestHeader(req, 'host');
        return typeof host === 'string' && host.length > 0 ? host : undefined;
    })();

    const currentHostname =
        typeof options.currentHostname === 'string' && options.currentHostname.length > 0
            ? (trimTrailingSlash(options.currentHostname) ?? '')
            : currentHost
              ? `${getProtocol()}://${currentHost}`
              : '';

    return {
        currentHostname,
        openApiJsonUrl: getOpenApiJsonUrl(currentHostname, options),
        hostnames: Array.isArray(options.hostnames) && options.hostnames.length > 0 ? options.hostnames : currentHostname ? [currentHostname] : [],
        variables: options.variables ?? {},
        headers: options.headers ?? {},
        postscripts: options.postscripts ?? {},
        bodies: options.bodies ?? {},
        favorites: options.favorites ?? [],
    };
}

function sendHtml(res: DokieResponseLike | undefined, html: string): unknown {
    if (!res) {
        throw new TypeError('A response object is required.');
    }

    if (typeof res.type === 'function') {
        res.type('html');
    }

    if (typeof res.setHeader === 'function') {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }

    if (typeof res.send === 'function') {
        return res.send(html);
    }

    if (typeof res.end === 'function') {
        return res.end(html);
    }

    throw new TypeError('The response object must support send() or end().');
}

export function createDokieServerExports(defaultAssetPath: string, readAsset: (assetPath: string) => string) {
    function getDokieAssetPath(): string {
        return defaultAssetPath;
    }

    function renderDokieHtml(options: DokieOptions = {}, req?: DokieRequestLike): string {
        const assetPath = options.assetPath ?? defaultAssetPath;
        const html = readAsset(assetPath);

        const dokieConfig = buildDokieConfig(options, req);

        const finalHtml = html.replace('/*dokie-inject-area*/', `window.dokie = ${safeJson(dokieConfig)};`);

        if (typeof options.title === 'string' && options.title.trim().length > 0) {
            return finalHtml.replace('<title>Dokie</title>', `<title>${escapeHtml(options.title)}</title>`);
        }

        return finalHtml;
    }

    function createDokieHandler(options: DokieOptions = {}) {
        return function dokieHandler(req: DokieRequestLike, res: DokieResponseLike): unknown {
            return sendHtml(res, renderDokieHtml(options, req));
        };
    }

    function registerDokieRoute(app: DokieAppLike, options: DokieOptions = {}) {
        if (!app || typeof app.get !== 'function') {
            throw new TypeError('registerDokieRoute expects an app with a get(path, handler) method.');
        }

        const routePath = options.routePath ?? '/dokie';
        const handler = createDokieHandler(options);
        app.get(routePath, handler);
        return handler;
    }

    return {
        createDokieHandler: createDokieHandler,
        createDokieMiddleware: createDokieHandler,
        getDokieAssetPath: getDokieAssetPath,
        registerDokieRoute: registerDokieRoute,
        renderDokieHtml: renderDokieHtml,
    };
}
