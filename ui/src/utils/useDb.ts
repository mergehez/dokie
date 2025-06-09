import Dexie, {type EntityTable} from 'dexie';
import {useDebounceFn} from "@vueuse/core";

export type EndpointId = string;

export type KeyVal = {
    readonly id: string
    key: string;
    value?: string;
    desc?: string;
    required?: boolean;
    locked?: boolean;
};

export type EndpointKeyVals = {
    query: KeyVal[];
    header: KeyVal[];
    route: KeyVal[];
}
type IdbKeyVal = {
    id?: number;
    e_id: EndpointId;
    value: EndpointKeyVals & {
        body: string;
        postscript?: string;
    }
}

export interface RequestInstance {
    request: {
        method: string
        url: string
        headers: Record<string, string>
        body: string
        postscript: string
    }
    response?: {
        duration: number // in milliseconds
        isSuccess: boolean
        isRedirect: boolean
        body: string
        status: number
        statusText: string
        size: number // in bytes
        isJson: boolean
        headers: [string, any][]
        contentType: string
        // cookies: Record<string, string>
    }
}

export type IdbRequestHistory = {
    id: number;
    date: Date;
    request: RequestInstance;
}

export type IdbNavState = {
    id: number;
    expanded_tags: EndpointId[];
    fav_endpoints: EndpointId[];
    selected_endpoints: EndpointId[];
    active_endpoint: EndpointId;
    sidebar_width: number; // percentage
    request_part_height: number; // percentage
}

export type GlobalKeyVals = {
    headers: KeyVal[];
    variables: KeyVal[];
    hostnames: string[];
    hostname: string;
}


let _db: Dexie & {
    keyVals: EntityTable<Required<IdbKeyVal>, 'id'>,
    globalKeyVals: EntityTable<{
        id: number;
        value: GlobalKeyVals;
    }, 'id'>,
    requestHistory: EntityTable<IdbRequestHistory, 'id'>,
    navState: EntityTable<{
        id: number;
        value: string;
    }, 'id'>
};
let _keyVals: IdbKeyVal[];
let _globalKeyVals: GlobalKeyVals;
let _requestHistory: IdbRequestHistory[];
let _navState: IdbNavState;

export function useDb() {
    return {
        init: async (dbName: string) => {
            console.log('initializing db with name:', dbName);
            _db = new Dexie(btoa(dbName) + '-555') as any;

            _db.version(1).stores({
                keyVals: '++id, &e_id, value', // Primary key and indexed props
                globalKeyVals: '++id, value',
                requestHistory: '++id, date, request',
                navState: '++id, value'
            });
            _keyVals = (await _db.keyVals.toArray()).map(e => ({
                ...e,
                // value: JSON.parse(e.value) as Record<Part, KeyVal[]>
            }));
            _globalKeyVals = (await _db.globalKeyVals.toArray())[0]?.value ?? {
                headers: [],
                variables: [],
                hostnames: [],
                hostname: '',
            } satisfies GlobalKeyVals

            _requestHistory = await _db.requestHistory.toArray();
            _navState = JSON.parse((await _db.navState.toArray()).find(t => t.id == 1)?.value ?? JSON.stringify({
                id: 1,
                expanded_tags: ['Favorites'],
                selected_endpoints: [],
                fav_endpoints: [],
                active_endpoint: '',
                sidebar_width: 31,
                request_part_height: 50,
            }));

        },
        keyVals: {
            value: _keyVals,
            getEndpoint: (e_id: EndpointId) => {
                const res = _keyVals.find(t => t.e_id == e_id)?.value ?? {} as IdbKeyVal['value'];
                res.header ??= [];
                res.query ??= [];
                res.route ??= [];
                res.body ??= '';

                return res;
            },
            upsert: async (e_id: EndpointId, value: IdbKeyVal['value']) => {
                const i = _keyVals.findIndex(t => t.e_id == e_id);
                const newIdbKv = {
                    e_id: e_id,
                    value: JSON.parse(JSON.stringify(value))
                } satisfies IdbKeyVal;
                if (i === -1) {
                    _keyVals.push(newIdbKv);
                } else {
                    _keyVals[i].value = value;
                }
            },
            updateDb: useDebounceFn(async () => {
                for (const kv of _keyVals) {
                    const json = JSON.parse(JSON.stringify(kv.value));//JSON.stringify(kv.value);
                    const existing = await _db.keyVals.filter(e => e.e_id == kv.e_id).first()
                    if (existing) {
                        await _db.keyVals.update(existing.id, {
                            e_id: kv.e_id,
                            value: json
                        });
                        console.log('updated keyval: ' + kv.e_id);
                    } else {
                        kv.id = await _db.keyVals.add({
                            e_id: kv.e_id,
                            value: json
                        });
                        console.log('added keyval: ' + kv.e_id);
                    }
                }
            }, 1500),
        },
        globalKeyVals: {
            value: _globalKeyVals,
            updateDb: useDebounceFn(async () => {
                const json = JSON.parse(JSON.stringify(_globalKeyVals));
                const len = await _db.globalKeyVals.count();
                if (len == 0) {
                    await _db.globalKeyVals.add({
                        id: 1,
                        value: json,
                    });
                    console.log('created global keyvals');
                } else {
                    await _db.globalKeyVals.update(1, {
                        value: json,
                    });
                    console.log('updated global keyvals');
                }
            }, 300),
        },
        requestHistory: {
            value: _requestHistory,
            updateDb: useDebounceFn(async () => {
                _db.requestHistory.bulkPut(_requestHistory).then(() => console.log('updated request history'))
            }, 500),
        },
        navState: {
            value: _navState,
            updateDb: useDebounceFn(async () => {
                const json = JSON.stringify(_navState);
                const len = await _db.navState.count();
                if (len == 0) {
                    await _db.navState.add({
                        id: 1,
                        value: json,
                    })
                    console.log('created nav state');
                } else {
                    await _db.navState.update(1, {
                        value: json,
                    });
                    console.log('updated nav state');
                }
            }, 1500),
        },
    };
}