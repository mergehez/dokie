import { _coreExports, type DokieOptions, type DokieRequestLike } from './base';

export type FastifyRawRequestLike = DokieRequestLike & {
    headers?: Record<string, string | string[] | undefined>;
    hostname?: string;
    protocol?: string;
};

export type FastifyRequestLike = {
    header?(name: string): string | undefined;
    headers?: Record<string, string | string[] | undefined>;
    hostname?: string;
    protocol?: string;
    raw?: FastifyRawRequestLike;
};

export type FastifyReplyLike = {
    header?(name: string, value: string): unknown;
    send?(body: string): unknown;
    type?(value: string): unknown;
};

export type FastifyInstanceLike = {
    get(path: string, handler: (req: FastifyRequestLike, reply: FastifyReplyLike) => unknown): unknown;
};
export function forFastify() {
    function normalizeFastifyRequest(req: FastifyRequestLike): DokieRequestLike {
        const header = (name: string) => {
            const rawHeader = req.raw?.header?.(name);
            if (typeof rawHeader === 'string' && rawHeader.length > 0) {
                return rawHeader;
            }

            const directHeader = req.header?.(name);
            if (typeof directHeader === 'string' && directHeader.length > 0) {
                return directHeader;
            }

            const headers = req.headers ?? req.raw?.headers;
            const value = headers?.[name.toLowerCase()] ?? headers?.[name];
            return Array.isArray(value) ? value[0] : value;
        };

        return {
            connection: req.raw?.connection,
            get: req.raw?.get?.bind(req.raw),
            header,
            headers: req.headers ?? req.raw?.headers,
            hostname: req.hostname ?? req.raw?.hostname,
            protocol: req.protocol ?? req.raw?.protocol,
            socket: req.raw?.socket,
        };
    }
    const renderDokieHtmlForFastify = (options: DokieOptions = {}, req?: FastifyRequestLike): string => {
        return _coreExports.renderDokieHtml(options, req ? normalizeFastifyRequest(req) : undefined);
    };

    function createDokieHandlerForFastify(options: DokieOptions = {}) {
        return function dokieFastifyHandler(req: FastifyRequestLike, reply: FastifyReplyLike): unknown {
            const html = renderDokieHtmlForFastify(options, req);

            if (typeof reply.type === 'function') {
                reply.type('text/html; charset=utf-8');
            }

            if (typeof reply.header === 'function') {
                reply.header('Content-Type', 'text/html; charset=utf-8');
            }

            if (typeof reply.send === 'function') {
                return reply.send(html);
            }

            throw new TypeError('The Fastify reply object must support send().');
        };
    }

    return {
        createDokieHandler: createDokieHandlerForFastify,
        createDokieMiddleware: createDokieHandlerForFastify,
        getDokieAssetPath: _coreExports.getDokieAssetPath,
        renderDokieHtml: renderDokieHtmlForFastify,
        registerDokieRoute(app: FastifyInstanceLike, options: DokieOptions = {}) {
            if (!app || typeof app.get !== 'function') {
                throw new TypeError('registerDokieRoute expects a Fastify instance with a get(path, handler) method.');
            }

            const routePath = options.routePath ?? '/dokie';
            const handler = createDokieHandlerForFastify(options);
            app.get(routePath, handler);
            return handler;
        },
    };
}
