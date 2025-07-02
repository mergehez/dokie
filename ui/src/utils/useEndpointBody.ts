import type {OpenAPIV3, ReferenceObject, RequestBodyObject, SchemaObject} from "@/utils/types.ts";
import {CommentedValue} from "@/utils/json_helpers.ts";

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
            }

            const res = {} as Record<string, any>;
            Object.entries(props).forEach(([key, value]) => {
                if (value.type == 'skip')
                    return;
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

export function generateDefaultBodyFromSchema(
    spec: OpenAPIV3,
    requestBody: RequestBodyObject,
    propsToSkip: string[] = []
): Parsed {
    if (!requestBody || !requestBody.content) {
        return Parsed.emptyObject()
    }

    // Find the first available content type (typically application/json)
    const contentTypes = Object.keys(requestBody.content);
    if (contentTypes.length === 0) {
        return Parsed.emptyObject()
    }

    const mediaTypeObject = requestBody.content[contentTypes[0]];
    if (!mediaTypeObject || !mediaTypeObject.schema) {
        return Parsed.emptyObject()
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
            'dateDeleted',
        );
    }

    return createDefaultFromSchema(spec, mediaTypeObject.schema, new Set(), propsToSkip);
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
                const refSchema = spec.components.schemas[schemaName];
                if ((refSchema as SchemaObject).readOnly)
                    return Parsed.skip();
                return createDefaultFromSchema(
                    spec,
                    refSchema,
                    newVisitedRefs,
                    propsToSkip
                );
            }
        }
        return Parsed.emptyObject();
    }

    // Use default value if provided in schema
    if (schema.default !== undefined) {
        return Parsed.primitive(schema.default, schema.description);
    }

    // Handle different types
    const type = Array.isArray(schema.type) ? schema.type.filter(t => t != 'null' && t != 'undefined')[0] : schema.type;
    switch (type) {
        case 'string':
            if (schema.format == 'date-time')
                return Parsed.primitive(new Date().toISOString(), schema.description);
            return Parsed.primitive('', schema.description);

        case 'number':
        case 'integer':
            if (schema.format == 'double')
                return Parsed.primitive(0.1, schema.description);
            if (schema.enum && schema.format == 'CustomEnum') {
                let comment = schema.enum.map(t => t.join(':')).join(', ');
                return Parsed.commentedValue(schema.enum[0][0], comment)
            }
            return Parsed.primitive(schema.minimum ?? 0, schema.description);

        case 'boolean':
            return Parsed.primitive(false, schema.description);

        case 'array':
            if (schema.items) {
                return Parsed.array([]);
            }
            return Parsed.array([]);

        case 'object':
            const res = new ParsedObject();
            if (schema.properties) {
                Object.entries(schema.properties).forEach(([propName, propSchema]) => {
                    if (propsToSkip.includes(propName))
                        return

                    const aa = createDefaultFromSchema(
                        spec,
                        propSchema,
                        visitedRefs,
                        propsToSkip
                    );

                    if (propName == 'id')
                        return res.optionalProps[propName] = aa;

                    let isRequired = false;
                    if (schema.required) {
                        isRequired = schema.required.includes(propName) || schema.required.includes(propName[0].toUpperCase() + propName.substring(1));
                    }

                    if (isRequired)
                        return res.requiredProps[propName] = aa

                    res.optionalProps[propName] = aa;
                });
            }

            return Parsed.object(res);

        default:
            return Parsed.emptyObject();
    }
}