import { _coreExports, type DokieOptions, type DokieRequestLike } from './base';

export type HonoRequestLike = {
    get?(name: string): string | undefined;
    header?(name: string): string | undefined;
    raw?: Request;
    url: string;
};

export type HonoContextLike = {
    html?(html: string, status?: number): unknown;
    req: HonoRequestLike;
};

export type HonoAppLike = {
    get(path: string, handler: (context: HonoContextLike) => unknown): unknown;
};
export function forHono() {
    function normalizeHonoRequest(req: HonoRequestLike): DokieRequestLike {
        const url = new URL(req.url);

        return {
            get: req.get?.bind(req),
            header: req.header?.bind(req),
            headers: req.raw ? Object.fromEntries(req.raw.headers.entries()) : undefined,
            hostname: url.host,
            protocol: url.protocol.replace(/:$/, ''),
        };
    }
    function renderDokieHtmlForHono(options: DokieOptions = {}, req?: HonoRequestLike): string {
        return _coreExports.renderDokieHtml(options, req ? normalizeHonoRequest(req) : undefined);
    }

    function createDokieHandlerForHono(options: DokieOptions = {}) {
        return function dokieHonoHandler(context: HonoContextLike): unknown {
            const html = renderDokieHtmlForHono(options, context.req);

            if (typeof context.html === 'function') {
                return context.html(html);
            }

            return new Response(html, {
                headers: {
                    'Content-Type': 'text/html; charset=utf-8',
                },
            });
        };
    }
    return {
        createDokieHandler: createDokieHandlerForHono,
        createDokieMiddleware: createDokieHandlerForHono,
        getDokieAssetPath: _coreExports.getDokieAssetPath,
        renderDokieHtml: renderDokieHtmlForHono,
        registerDokieRoute(app: HonoAppLike, options: DokieOptions = {}) {
            if (!app || typeof app.get !== 'function') {
                throw new TypeError('registerDokieRoute expects a Hono app with a get(path, handler) method.');
            }

            const routePath = options.routePath ?? '/dokie';
            const handler = createDokieHandlerForHono(options);
            app.get(routePath, handler);
            return handler;
        },
    };
}
