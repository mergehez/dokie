export default function HomePage() {
    return (
        <main style={{ padding: '2rem', lineHeight: 1.5 }}>
            <h1>Dokie Next Demo</h1>
            <p>This demo uses Dokie at the Next.js route-handler level via standard Request/Response APIs.</p>
            <ul>
                <li>
                    <a href="/dokie">Open Dokie UI</a>
                </li>
                <li>
                    <a href="/api/openapi.json">Open OpenAPI JSON</a>
                </li>
                <li>
                    <a href="/api/hello">Open sample API route</a>
                </li>
            </ul>
        </main>
    );
}
