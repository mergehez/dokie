// Helpers for masking secret key-value pairs (passwords, tokens, ...).
//
// The masked state of each row is persisted per row id in localStorage, and
// falls back to the row's stored `masked` flag (IndexedDB) and finally to
// automatic detection based on the key name.

const STORAGE_KEY = 'dokie:masked-keyvals:v1';

// Key names (normalized: lowercase, `-`/`_`/` ` removed) treated as secrets.
// Covers `password`, `pass`, `client-secret`, `clientSecret`, `client_secret`, etc.
const SECRET_NAMES = new Set([
    'password',
    'passwd',
    'pass',
    'pwd',
    'passphrase',
    'secret',
    'secretkey',
    'clientsecret',
    'apisecret',
    'token',
    'accesstoken',
    'refreshtoken',
    'idtoken',
    'authtoken',
    'bearertoken',
    'bearer',
    'authorization',
    'apikey',
    'xapikey',
    'privatekey',
    'clientkey',
    'masterkey',
    'credentials',
    'credential',
    'sessiontoken',
    'sessionid',
    'otp',
    'passcode',
]);

export function normalizeKeyName(name: string | undefined | null): string {
    return (name ?? '').toLowerCase().replace(/[-_\s]/g, '');
}

export function isSecretName(name: string | undefined | null): boolean {
    const normalized = normalizeKeyName(name);
    return normalized !== '' && SECRET_NAMES.has(normalized);
}

function readOverrides(): Record<string, boolean> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed as Record<string, boolean>;
    } catch {
        // corrupted or unavailable storage: fall through to defaults
    }
    return {};
}

function writeOverrides(map: Record<string, boolean>) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch {
        // storage unavailable (private mode, etc.): masking still works for the session
    }
}

/** Explicit per-row override previously saved via the row menu, if any. */
export function getMaskedOverride(id: string): boolean | undefined {
    const value = readOverrides()[id];
    return typeof value === 'boolean' ? value : undefined;
}

/** Persist an explicit per-row masked state in localStorage. */
export function setMaskedOverride(id: string, masked: boolean) {
    const map = readOverrides();
    map[id] = masked;
    writeOverrides(map);
}

/** Effective masked state: explicit override > stored flag > secret-name auto-detection. */
export function isMasked(row: { id: string; key?: string; masked?: boolean }): boolean {
    return getMaskedOverride(row.id) ?? row.masked ?? isSecretName(row.key);
}
