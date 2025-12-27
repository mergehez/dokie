import type {RouteRecordRaw} from 'vue-router';

export const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Home',
        component: () => import('./pages/Home.vue'),
    },
    {
        path: '/documentation',
        name: 'Docs',
        component: () => import('./pages/Docs.vue'),
    },
    {
        path: '/blog',
        name: 'Blog',
        component: () => import('./pages/Blog.vue'),
    },
    {
        path: '/pricing',
        name: 'Pricing',
        component: () => import('./pages/Pricing.vue'),
    },
    {
        path: '/:catchAll(.*)',
        name: 'NotFound',
        component: () => import('./pages/NotFound.vue'),
    },
];

export default routes;

