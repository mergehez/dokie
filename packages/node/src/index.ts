import { forCustomServer, forFetch } from './base';
import { forExpress } from './express';
import { forFastify } from './fastify';
import { forHono } from './hono';

export type { DokieAppLike, DokieFetchRequestLike, DokieOptions, DokieRequestLike, DokieResponseLike } from './base';

export { forCustomServer, forExpress, forFastify, forFetch, forHono };
