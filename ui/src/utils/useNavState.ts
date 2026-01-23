import {reactive, ref, watch} from "vue";
import {type CustomEndpointDef, type Endpoint, useCustomEndpoint} from "@/utils/useEndpoint.ts";
import {useSpec} from "@/utils/useSpec.ts";
import {useDb} from "@/utils/useDb.ts";
import {JSONC} from "@/utils/json_helpers.ts";
import {useAppConfig} from "@/utils/useAppConfig.ts";
import {distinct, distinctBy, uniqueId} from "@/utils/utils.ts";

export const CustomEndpointsTag = '_DokieCustoms' as const;

const createNavState = () => {
    const db = useDb();
    const navState = db.navState.value;
    const {allEndpoints, spec: openApiSpecs} = useSpec();

    let init = allEndpoints.reduce((acc, e) => {
        (e.tags ?? ['uncategorized']).forEach(tag => {
            if (!acc[tag]) {
                acc[tag] = [];
            }
            acc[tag].push(e);
        });
        return acc;
    }, {} as Record<string, Endpoint[]>);
    if (Object.keys(init).length === 1 && init['uncategorized']) {
        // If there's only one group and it's 'uncategorized', we can just use that directly
        init = {'All Endpoints': init['uncategorized']};
    }

    console.log(init, navState.custom_endpoints, navState.active_endpoint)
    const customEndpoints = ref(distinctBy(navState.custom_endpoints, t => t.name + t.path).map(t => {
        return useCustomEndpoint(t, openApiSpecs);
    }))

    const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
    const appConfig = useAppConfig();
    const groupedEndpoints = ref(
        Object.keys(init)
            .sort((a, b) => a.localeCompare(b))
            .reduce((acc, key) => {
                acc[key] = init[key]!.sort((a, b) => methods.indexOf(a.method) - methods.indexOf(b.method) || a.id.localeCompare(b.id));
                return acc;
            }, {
                'Favorites': distinct([...appConfig.favorites, ...navState.fav_endpoints])
                    .map(t => allEndpoints.find(e => e.id === t))
                    .filter(e => e),
                [CustomEndpointsTag]: customEndpoints.value
            } as Record<string, Endpoint[]>)
    );

    navState.expanded_tags = Object.keys(groupedEndpoints.value).filter(e => navState.expanded_tags.includes(e));
    const expandedGroups = ref(navState.expanded_tags);
    const favEndpoints = ref(allEndpoints.filter(e => navState.fav_endpoints.includes(e.id)).map(t => t.id))
    // const customEndpointIds = ref(customEndpoints.map(t => t.id));
    const selectedEndpoints = ref(
        navState.selected_endpoints
            // .map(t => allEndpoints.find(e => e.id === t))
            .map(t => Object.values(groupedEndpoints.value).flatMap(t => t).find(e => e.id === t))
            .filter(e => e)
            .map(t => t!)
    );
    const activeEndpoint = ref(Object.values(groupedEndpoints.value).flatMap(t => t).find(t => t.id == navState.active_endpoint));
    const sidebarWidth = ref(navState.sidebar_width);
    const requestPartHeight = ref(navState.request_part_height);

    watch(expandedGroups, (nv) => {
        navState.expanded_tags = [...nv];
        db.navState.updateDb();
    }, {deep: true});
    watch(favEndpoints, (nv) => {
        navState.fav_endpoints = [...nv];
        db.navState.updateDb();
    }, {deep: true});
    watch(customEndpoints, (nv) => {
        console.log('custom endpoints changed', nv);
        navState.custom_endpoints = nv.map(ep => {
            // const ep = nv.find(t => t.id == e.id);
            return {
                id: ep.id,
                name: ep.name,
                method: ep.method,
                path: ep.path,
            } satisfies CustomEndpointDef;
        }).filter(t => t) as any[];
        console.log('updating custom endpoints in nav state', nv, customEndpoints);
        db.navState.updateDb();
    }, {deep: true});
    watch(selectedEndpoints, (nv) => {
        navState.selected_endpoints = nv.map(t => t.id);
        db.navState.updateDb();
    }, {deep: true});
    watch(activeEndpoint, (nv) => {
        if (nv?.id == navState.active_endpoint)
            return;
        navState.active_endpoint = nv?.id ?? '';
        db.navState.updateDb();
    })
    watch(sidebarWidth, (nv) => {
        if (nv == navState.sidebar_width)
            return;
        navState.sidebar_width = nv;
        db.navState.updateDb();
    });
    watch(requestPartHeight, (nv) => {
        if (nv == navState.request_part_height)
            return;
        navState.request_part_height = nv;
        db.navState.updateDb();
    });

    const toggleGroup = (tag: string) => {
        const i = expandedGroups.value.indexOf(tag);
        if (i >= 0) {
            expandedGroups.value.splice(i, 1)
        } else {
            expandedGroups.value.push(tag)
        }
    }

    function addCustomEndpoint() {
        const id = uniqueId();
        let newName = 'New Custom Endpoint';
        for (let i = 0; ; i++) {
            if (!customEndpoints.value.find(t => t.name === newName)) {
                break;
            }
            newName = `New Custom Endpoint ${i + 2}`;
        }
        const ne = useCustomEndpoint({
            id: id,
            name: newName,
            method: 'GET',
            path: '',
        }, openApiSpecs);

        const existingEmpty = customEndpoints.value.find(t => t.request.method == ne.request.method && t.request.url == ne.request.url);
        if (existingEmpty) {
            alert('There is an unmodified endpoint already. Please modify that one first.');
            selectEndpoint(existingEmpty);
            return;
        }

        customEndpoints.value.push(ne);
        selectEndpoint(ne);
    }

    function deleteCustomEndpoint(endpoint: Endpoint) {
        if (!confirm(`Are you sure you want to delete the custom endpoint "${endpoint.name}"? This action cannot be undone.`)) {
            return;
        }
        const i = customEndpoints.value.findIndex(t => t.id == endpoint.id);
        if (i >= 0) {
            customEndpoints.value.splice(i, 1);
            groupedEndpoints.value[CustomEndpointsTag] = groupedEndpoints.value[CustomEndpointsTag]!.filter(t => t.id != endpoint.id);
            unselectEndpoint(endpoint);
        }
    }

    const selectEndpoint = (endpoint: Endpoint) => {
        // console.log('select', endpoint)
        endpoint.request.body ||= JSONC.stringify(endpoint.generateDefaultBody().unparse(false));
        activeEndpoint.value = endpoint
        if (!selectedEndpoints.value.some(t => t.id == endpoint.id)) {
            selectedEndpoints.value.push(endpoint)
        }
    }
    const unselectEndpoint = (endpoint: Endpoint) => {
        const i = selectedEndpoints.value.findIndex(t => t.id == endpoint.id)
        if (i >= 0) {
            selectedEndpoints.value.splice(i, 1)
            activeEndpoint.value = allEndpoints.find(t => t.id == (selectedEndpoints.value[i] ?? selectedEndpoints.value[i - 1])?.id)
        }
    }

    const toggleFav = (endpoint: Endpoint) => {
        const i = favEndpoints.value.indexOf(endpoint.id);
        if (i >= 0) {
            favEndpoints.value.splice(i, 1)
        } else {
            favEndpoints.value.push(endpoint.id)
        }

        groupedEndpoints.value['Favorites'] = allEndpoints.filter(e => favEndpoints.value.includes(e.id));
    };
    return reactive({
        sidebarWidth: sidebarWidth,
        requestPartHeight: requestPartHeight,
        groupedEndpoints: groupedEndpoints,
        isGroupExpanded: (tag: string) => expandedGroups.value.includes(tag),
        toggleGroup: toggleGroup,
        selectedEndpoints: selectedEndpoints,
        activeEndpoint: activeEndpoint,
        selectEndpoint: selectEndpoint,
        unselectEndpoint: unselectEndpoint,
        isFav: (endpoint: Endpoint) => favEndpoints.value.includes(endpoint.id),
        toggleFav: toggleFav,
        addCustomEndpoint: addCustomEndpoint,
        deleteCustomEndpoint: deleteCustomEndpoint,
    });
}
let _navState: ReturnType<typeof createNavState>;
export const useNavState = () => {
    return _navState ??= createNavState();
};
