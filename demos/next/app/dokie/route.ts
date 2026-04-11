import * as dokie from '@mergehez/dokie-node';

export const GET = dokie.forFetch().createDokieHandler({
    title: 'Dokie Next Demo',
    openApiJsonUrl: '/api/openapi.json',
});
