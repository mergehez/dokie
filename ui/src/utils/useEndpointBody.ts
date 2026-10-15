import type { OpenAPIV3, ReferenceObject, RequestBodyObject, SchemaObject } from '@/utils/types.ts';
import { CommentedValue } from '@/utils/json_helpers.ts';

export class ParsedObject {
    requiredProps: Record<string, Parsed> = {};
    optionalProps: Record<string, Parsed> = {};
}

export class Parsed {
    type: 'primitive' | 'array' | 'skip' | 'emptyObject' | 'parsedObject' | 'commentedValue';
    value: any;

    constructor(type: 'primitive' | 'array' | 'skip' | 'emptyObject' | 'parsedObject' | 'commentedValue', value: any) {
        this.type = type;
        this.value = value;
    }

    static emptyObject() {
        return new Parsed('emptyObject', {});
    }

    static skip() {
        return new Parsed('skip', undefined);
    }

    static object(obj: ParsedObject) {
        return new Parsed('parsedObject', obj);
    }

    static commentedValue(value: any, comment: string) {
        return new Parsed('commentedValue', new CommentedValue(value, comment));
    }

    static primitive(value: string | number | boolean, comment?: string) {
        if (comment) {
            return Parsed.commentedValue(value, comment);
        }
        return new Parsed('primitive', value);
    }

    static array(value: Parsed[]) {
        return new Parsed('array', value);
    }

    public unparse(onlyRequired: boolean): any {
        if (this.type == 'parsedObject') {
            const v = this.value as ParsedObject;
            const props = {
                ...v.requiredProps,
                ...(onlyRequired ? {} : v.optionalProps),
            };

            const res = {} as Record<string, any>;
            Object.entries(props).forEach(([key, value]) => {
                if (value.type == 'skip') return;
                res[key] = value.unparse(onlyRequired);
            });
            return res;
        }
        if (this.type == 'array') {
            return this.value.map((t: Parsed) => t.unparse(onlyRequired));
        }

        // primitive or commentedValue
        return this.value;
    }
}

export type RequestBodySchema = {
    required: string[];
    properties: Record<string, RequestBodySchema>;
    items?: RequestBodySchema;
};

export type ResolvedBodyValue = { keep: true; value: unknown } | { keep: false };

export function getRequestBodySchema(spec: OpenAPIV3, requestBody?: RequestBodyObject | ReferenceObject): RequestBodySchema | undefined {
    const resolvedRequestBody = resolveRequestBodyReference(spec, requestBody);
    if (!resolvedRequestBody) return undefined;

    const content = Object.entries(resolvedRequestBody.content ?? {});
    const mediaType = content.find(([type]) => type === 'application/json' || type.endsWith('+json'))?.[1] ?? content[0]?.[1];
    if (!mediaType?.schema) return undefined;

    return createRequestBodySchema(spec, mediaType.schema);
}

function resolveRequestBodyReference(spec: OpenAPIV3, requestBody?: RequestBodyObject | ReferenceObject, visitedRefs = new Set<string>()): RequestBodyObject | undefined {
    if (!requestBody) return undefined;
    if (!('$ref' in requestBody)) return requestBody;
    if (visitedRefs.has(requestBody.$ref)) return undefined;

    const name = getComponentName(requestBody.$ref, 'requestBodies');
    const referencedBody = name ? spec.components?.requestBodies?.[name] : undefined;
    if (!referencedBody) return undefined;

    const nextVisitedRefs = new Set(visitedRefs);
    nextVisitedRefs.add(requestBody.$ref);
    return resolveRequestBodyReference(spec, referencedBody, nextVisitedRefs);
}

function getComponentName(ref: string, component: 'requestBodies' | 'schemas'): string | undefined {
    const prefix = `#/components/${component}/`;
    if (!ref.startsWith(prefix)) return undefined;
    return ref.slice(prefix.length).replace(/~1/g, '/').replace(/~0/g, '~');
}

function createRequestBodySchema(spec: OpenAPIV3, schema: SchemaObject | ReferenceObject, visitedRefs = new Set<string>()): RequestBodySchema {
    if ('$ref' in schema) {
        if (visitedRefs.has(schema.$ref)) return { required: [], properties: {} };
        const name = getComponentName(schema.$ref, 'schemas');
        const referencedSchema = name ? spec.components?.schemas?.[name] : undefined;
        if (!referencedSchema) return { required: [], properties: {} };

        const nextVisitedRefs = new Set(visitedRefs);
        nextVisitedRefs.add(schema.$ref);
        return createRequestBodySchema(spec, referencedSchema, nextVisitedRefs);
    }

    let result: RequestBodySchema = { required: [], properties: {} };
    for (const allOfSchema of schema.allOf ?? []) {
        result = mergeRequestBodySchemas(result, createRequestBodySchema(spec, allOfSchema, visitedRefs));
    }

    const properties = Object.fromEntries(Object.entries(schema.properties ?? {}).map(([name, value]) => [name, createRequestBodySchema(spec, value, visitedRefs)]));
    result = mergeRequestBodySchemas(result, {
        required: schema.required ?? [],
        properties,
        ...(schema.items ? { items: createRequestBodySchema(spec, schema.items, visitedRefs) } : {}),
    });

    return result;
}

function mergeRequestBodySchemas(left: RequestBodySchema, right: RequestBodySchema): RequestBodySchema {
    const properties = { ...left.properties };
    for (const [name, schema] of Object.entries(right.properties)) {
        properties[name] = properties[name] ? mergeRequestBodySchemas(properties[name]!, schema) : schema;
    }

    const items = left.items && right.items ? mergeRequestBodySchemas(left.items, right.items) : (left.items ?? right.items);
    return {
        required: [...new Set([...left.required, ...right.required])],
        properties,
        ...(items ? { items } : {}),
    };
}

export function resolveBodyVariables(
    value: unknown,
    schema: RequestBodySchema | undefined,
    resolveString: (value: string) => string,
    onMissingRequired: (path: string) => never,
    path = ''
): ResolvedBodyValue {
    if (typeof value === 'string') {
        const resolvedValue = resolveString(value);
        const containsVariable = /{{[A-Za-z0-9_-]+}}|(?<!\{)\{[A-Za-z0-9_-]+\}(?!\})/.test(value);
        return value.trim() && containsVariable && !resolvedValue.trim() ? { keep: false } : { keep: true, value: resolvedValue };
    }

    if (Array.isArray(value)) {
        const resolvedItems: unknown[] = [];
        value.forEach((item, index) => {
            const resolvedItem = resolveBodyVariables(item, schema?.items, resolveString, onMissingRequired, `${path}[${index}]`);
            if (resolvedItem.keep) resolvedItems.push(resolvedItem.value);
        });
        if (path && value.length > 0 && resolvedItems.length === 0) return { keep: false };
        return { keep: true, value: resolvedItems };
    }

    if (value && typeof value === 'object') {
        const object = value as Record<string, unknown>;
        for (const key of Object.keys(object)) {
            const propertyPath = path ? `${path}.${key}` : key;
            const propertySchema = schema?.properties[key];
            const resolvedValue = resolveBodyVariables(object[key], propertySchema, resolveString, onMissingRequired, propertyPath);
            if (!resolvedValue.keep) {
                const capitalizedKey = `${key.charAt(0).toUpperCase()}${key.slice(1)}`;
                const isRequired = schema?.required.some((name) => name === key || name === capitalizedKey);
                if (isRequired) onMissingRequired(propertyPath);
                delete object[key];
            } else {
                object[key] = resolvedValue.value;
            }
        }
        return { keep: true, value: object };
    }

    return { keep: true, value };
}

export function generateDefaultBodyFromSchema(spec: OpenAPIV3, requestBody: RequestBodyObject, propsToSkip: string[] = []): Parsed {
    if (!requestBody || !requestBody.content) {
        return Parsed.emptyObject();
    }

    // Find the first available content type (typically application/json)
    const contentTypes = Object.keys(requestBody.content);
    if (contentTypes.length === 0) {
        return Parsed.emptyObject();
    }

    const mediaTypeObject = requestBody.content[contentTypes[0]!];
    if (!mediaTypeObject || !mediaTypeObject.schema) {
        return Parsed.emptyObject();
    }

    if (propsToSkip.length == 0) {
        propsToSkip.push(
            'createdBy',
            'createdById',
            'createdAt',
            'dateCreated',
            'updatedBy',
            'updatedById',
            'updatedAt',
            'modifiedBy',
            'modifiedById',
            'modifiedAt',
            'dateModified',
            'dateUpdated',
            'deletedBy',
            'deletedById',
            'deletedAt',
            'dateDeleted'
        );
    }

    return createDefaultFromSchema(spec, mediaTypeObject.schema, new Set(), propsToSkip);
}

// Some generators (e.g. .NET) emit schemas without an explicit `type`
// (e.g. `{ "pattern": "...", "format": "int32" }`). Infer it so these
// properties don't fall through to an empty object.
function inferTypeFromSchema(schema: SchemaObject): SchemaObject['type'] {
    if (schema.format) {
        switch (schema.format) {
            case 'int32':
            case 'int64':
                return 'integer';
            case 'float':
            case 'double':
            case 'decimal':
                return 'number';
            case 'boolean':
                return 'boolean';
            default:
                return 'string';
        }
    }
    if (schema.properties) return 'object';
    if (schema.items) return 'array';
    if (schema.pattern) return 'string';
    if (schema.enum && schema.enum.length > 0) {
        const first = schema.enum[0];
        if (typeof first == 'string') return 'string';
        if (typeof first == 'boolean') return 'boolean';
        if (typeof first == 'number') return Number.isInteger(first) ? 'integer' : 'number';
    }
    return undefined;
}

function createDefaultFromSchema(
    spec: OpenAPIV3,
    schema: SchemaObject | ReferenceObject,
    visitedRefs: Set<string> = new Set(),
    propsToSkip: string[]
    // ): EmptyObject | CommentedValue | number | string | boolean | any[] | RequestBody {
): Parsed {
    if (!schema) return Parsed.emptyObject();

    // Handle $ref objects by resolving the reference
    if ('$ref' in schema) {
        const refPath = schema.$ref;

        // Check for circular references
        if (visitedRefs.has(refPath)) {
            return Parsed.emptyObject(); // Break the recursion by returning an empty object
        }

        // Add this ref to the visited set
        const newVisitedRefs = new Set(visitedRefs);
        newVisitedRefs.add(refPath);

        if (refPath.startsWith('#/components/schemas/')) {
            const schemaName = refPath.replace('#/components/schemas/', '');
            if (spec.components?.schemas && schemaName in spec.components.schemas) {
                const refSchema = spec.components.schemas[schemaName]!;
                if ((refSchema as SchemaObject).readOnly) return Parsed.skip();
                return createDefaultFromSchema(spec, refSchema, newVisitedRefs, propsToSkip);
            }
        }
        return Parsed.emptyObject();
    }

    // Use default value if provided in schema
    if (schema.default !== undefined) {
        return Parsed.primitive(schema.default, schema.description);
    }

    // Handle different types
    const type = (Array.isArray(schema.type) ? schema.type.filter((t) => t != 'null' && t != 'undefined')[0] : schema.type) ?? inferTypeFromSchema(schema);
    switch (type) {
        case 'string':
            if (schema.format == 'date-time') return Parsed.primitive(new Date().toISOString(), schema.description);
            return Parsed.primitive('', schema.description);

        case 'number':
        case 'integer':
            if (schema.format == 'double') return Parsed.primitive(0.1, schema.description);
            if (schema.enum && schema.format == 'CustomEnum') {
                let comment = schema.enum.map((t) => t.join(':')).join(', ');
                return Parsed.commentedValue(schema.enum[0][0], comment);
            }
            return Parsed.primitive(schema.minimum ?? 0, schema.description);

        case 'boolean':
            return Parsed.primitive(false, schema.description);

        case 'array': {
            if (!schema.items) {
                return Parsed.array([]);
            }
            const example = createDefaultFromSchema(spec, schema.items, visitedRefs, propsToSkip);
            if (example.type == 'skip') {
                return Parsed.array([]);
            }
            return Parsed.array([example]);
        }

        case 'object':
            const res = new ParsedObject();
            if (schema.properties) {
                Object.entries(schema.properties).forEach(([propName, propSchema]) => {
                    if (propsToSkip.includes(propName)) return;

                    const aa = createDefaultFromSchema(spec, propSchema, visitedRefs, propsToSkip);

                    if (propName == 'id') return (res.optionalProps[propName] = aa);

                    let isRequired = false;
                    if (schema.required) {
                        isRequired = schema.required.includes(propName) || schema.required.includes(propName[0]!.toUpperCase() + propName.substring(1));
                    }

                    if (isRequired) return (res.requiredProps[propName] = aa);

                    res.optionalProps[propName] = aa;
                });
            }

            return Parsed.object(res);

        default:
            return Parsed.emptyObject();
    }
}
