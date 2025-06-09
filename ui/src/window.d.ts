export {}
declare global {
    interface Window {
        dokie?: {
            currentHostname: string,
            openApiJsonUrl: string,
            hostnames: string[],
            variables: Record<string, string>,
            headers: Record<string, string>,
            postscripts: Record<string, string>,
            favorites: string[],
        };
    }
}