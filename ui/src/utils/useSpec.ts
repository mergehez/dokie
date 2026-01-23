import type {OpenAPIV3} from "@/utils/types.ts";
import {type Endpoint, useEndpoint} from "@/utils/useEndpoint.ts";

let _spec: OpenAPIV3;

export function useSpec(spec?: OpenAPIV3) {
    _spec ??= spec!;

    // const db = useDb();
    // db.

    return {
        spec: _spec,
        allEndpoints: Object.entries(_spec.paths ?? []).flatMap(([path, methods]) => {
            return Object.entries(methods as object).map(([method, details]) => {
                return useEndpoint({
                    path,
                    method: method.toUpperCase(),
                    openApiEndpoint: details,
                    addDefaults: true,
                    spec
                });
            })
        }) satisfies Endpoint[],
    };
}