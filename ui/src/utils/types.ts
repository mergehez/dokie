export type OpenAPIV3 = {
    openapi: string; // must be 3.x.x
    info: InfoObject;
    servers?: ServerObject[];
    paths: OpenApiPathsObject;
    components?: ComponentsObject;
    security?: SecurityRequirementObject[];
    tags?: TagObject[];
    externalDocs?: ExternalDocumentationObject;
};

export type InfoObject = {
    title: string;
    description?: string;
    termsOfService?: string;
    contact?: ContactObject;
    license?: LicenseObject;
    version: string;
};

export type ContactObject = {
    name?: string;
    url?: string;
    email?: string;
};

export type LicenseObject = {
    name: string;
    url?: string;
};

export type ServerObject = {
    url: string;
    description?: string;
    variables?: Record<string, ServerVariableObject>;
};

export type ServerVariableObject = {
    enum?: string[];
    default: string;
    description?: string;
};

export type OpenApiPathsObject = Record<string, OpenApiPathItemObject>;

export type OpenApiPathItemObject = {
    $ref?: string;
    summary?: string;
    description?: string;
    get?: OpenApiEndpoint;
    put?: OpenApiEndpoint;
    post?: OpenApiEndpoint;
    delete?: OpenApiEndpoint;
    options?: OpenApiEndpoint;
    head?: OpenApiEndpoint;
    patch?: OpenApiEndpoint;
    trace?: OpenApiEndpoint;
    servers?: ServerObject[];
    parameters?: (ParameterObject | ReferenceObject)[];
};

export type OpenApiEndpoint = {
    tags?: string[];
    summary?: string;
    description?: string;
    externalDocs?: ExternalDocumentationObject;
    operationId?: string;
    parameters?: (ParameterObject | ReferenceObject)[];
    requestBody?: RequestBodyObject | ReferenceObject;
    responses?: ResponsesObject;
    callbacks?: Record<string, CallbackObject | ReferenceObject>;
    deprecated?: boolean;
    security?: SecurityRequirementObject[];
    servers?: ServerObject[];
};

export type ExternalDocumentationObject = {
    description?: string;
    url: string;
};

export type ParameterObject = {
    name: string;
    in: 'query' | 'header' | 'path' | 'cookie';
    description?: string;
    required?: boolean;
    deprecated?: boolean;
    allowEmptyValue?: boolean;
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
    schema?: SchemaObject | ReferenceObject;
    example?: any;
    examples?: Record<string, ExampleObject | ReferenceObject>;
    content?: ContentObject;
};

export type RequestBodyObject = {
    description?: string;
    content: ContentObject;
    required?: boolean;
};

export type ContentObject = Record<string, MediaTypeObject>;

export type MediaTypeObject = {
    schema?: SchemaObject | ReferenceObject;
    example?: any;
    examples?: Record<string, ExampleObject | ReferenceObject>;
    encoding?: Record<string, EncodingObject>;
};

export type EncodingObject = {
    contentType?: string;
    headers?: Record<string, HeaderObject | ReferenceObject>;
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
};

export type ResponsesObject = Record<string, ResponseObject | ReferenceObject>;

export type ResponseObject = {
    description: string;
    headers?: Record<string, HeaderObject | ReferenceObject>;
    content?: ContentObject;
    links?: Record<string, LinkObject | ReferenceObject>;
};

export type CallbackObject = Record<string, OpenApiPathItemObject>;

export type ExampleObject = {
    summary?: string;
    description?: string;
    value?: any;
    externalValue?: string;
};

export type LinkObject = {
    operationRef?: string;
    operationId?: string;
    parameters?: Record<string, any>;
    requestBody?: any;
    description?: string;
    server?: ServerObject;
};

export type HeaderObject = Omit<ParameterObject, 'name' | 'in'>;

export type TagObject = {
    name: string;
    description?: string;
    externalDocs?: ExternalDocumentationObject;
};

export type ReferenceObject = {
    $ref: string;
};

export type SchemaObject = {
    title?: string;
    multipleOf?: number;
    maximum?: number;
    exclusiveMaximum?: boolean;
    minimum?: number;
    exclusiveMinimum?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;
    maxProperties?: number;
    minProperties?: number;
    required?: string[];
    enum?: any[];
    type?: 'array' | 'boolean' | 'integer' | 'number' | 'object' | 'string';
    allOf?: (SchemaObject | ReferenceObject)[];
    oneOf?: (SchemaObject | ReferenceObject)[];
    anyOf?: (SchemaObject | ReferenceObject)[];
    not?: SchemaObject | ReferenceObject;
    items?: SchemaObject | ReferenceObject;
    properties?: Record<string, SchemaObject | ReferenceObject>;
    additionalProperties?: boolean | SchemaObject | ReferenceObject;
    description?: string;
    format?: string;
    default?: any;
    nullable?: boolean;
    discriminator?: DiscriminatorObject;
    readOnly?: boolean;
    writeOnly?: boolean;
    xml?: XMLObject;
    externalDocs?: ExternalDocumentationObject;
    example?: any;
    deprecated?: boolean;
};

export type DiscriminatorObject = {
    propertyName: string;
    mapping?: Record<string, string>;
};

export type XMLObject = {
    name?: string;
    namespace?: string;
    prefix?: string;
    attribute?: boolean;
    wrapped?: boolean;
};

export type SecurityRequirementObject = Record<string, string[]>;

export type ComponentsObject = {
    schemas?: Record<string, SchemaObject | ReferenceObject>;
    responses?: Record<string, ResponseObject | ReferenceObject>;
    parameters?: Record<string, ParameterObject | ReferenceObject>;
    examples?: Record<string, ExampleObject | ReferenceObject>;
    requestBodies?: Record<string, RequestBodyObject | ReferenceObject>;
    headers?: Record<string, HeaderObject | ReferenceObject>;
    securitySchemes?: Record<string, SecuritySchemeObject | ReferenceObject>;
    links?: Record<string, LinkObject | ReferenceObject>;
    callbacks?: Record<string, CallbackObject | ReferenceObject>;
};

export type SecuritySchemeObject = {
    type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
    description?: string;
    name?: string;
    in?: 'query' | 'header' | 'cookie';
    scheme?: string;
    bearerFormat?: string;
    flows?: OAuthFlowsObject;
    openIdConnectUrl?: string;
};

export type OAuthFlowsObject = {
    implicit?: OAuthFlowObject;
    password?: OAuthFlowObject;
    clientCredentials?: OAuthFlowObject;
    authorizationCode?: OAuthFlowObject;
};

export type OAuthFlowObject = {
    authorizationUrl?: string;
    tokenUrl?: string;
    refreshUrl?: string;
    scopes: Record<string, string>;
};