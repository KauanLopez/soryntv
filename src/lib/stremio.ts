import { Component } from 'react';

// --- 1. Data Structures (Interfaces) ---

export interface CatalogItem {
    type: string;
    id: string;
    name: string;
    poster?: string;
    description?: string;
    background?: string;
    logo?: string;
    [key: string]: any;
}

export interface Stream {
    url?: string;
    infoHash?: string;
    fileIdx?: number;
    externalUrl?: string; // Support for external players
    title?: string;
    name?: string;
    description?: string;
    behaviorHints?: {
        bingeGroup?: string;
        notWebReady?: boolean;
        [key: string]: any;
    };
    [key: string]: any;
}

export interface MetaDetail {
    id: string;
    type: string;
    name: string;
    description?: string;
    poster?: string;
    background?: string;
    logo?: string;
    releaseInfo?: string;
    imdbRating?: string;
    genres?: string[];
    cast?: string[];
    director?: string[];
    runtime?: string;
    videos?: { id: string; title: string; released: string;[key: string]: any }[]; // Episodes
    [key: string]: any;
}

export interface ManifestResourceObject {
    name: string;
    types: string[];
    idPrefixes?: string[];
}

// Resource can be a short string or a full object definition
export type ManifestResource = string | ManifestResourceObject;

export interface Manifest {
    id: string;
    version: string;
    name: string;
    description?: string;
    logo?: string;
    background?: string;
    resources: ManifestResource[];
    types: string[];
    catalogs: {
        type: string;
        id: string;
        name?: string;
        extra?: { name: string; isRequired?: boolean; options?: string[] }[];
    }[];
    idPrefixes?: string[];
    [key: string]: any;
}

// --- 2. Validation Helpers ---

function isValidManifest(data: any): data is Manifest {
    return (
        typeof data === 'object' &&
        data !== null &&
        typeof data.id === 'string' &&
        typeof data.version === 'string' &&
        typeof data.name === 'string' &&
        Array.isArray(data.resources) &&
        Array.isArray(data.types)
    );
}

function isValidStreamList(data: any): data is { streams: Stream[] } {
    return (
        typeof data === 'object' &&
        data !== null &&
        Array.isArray(data.streams)
    );
}

function isValidMeta(data: any): data is { meta: MetaDetail } {
    return (
        typeof data === 'object' &&
        data !== null &&
        typeof data.meta === 'object' &&
        data.meta !== null &&
        typeof data.meta.id === 'string'
    );
}

function isValidCatalog(data: any): data is { metas: CatalogItem[] } {
    return (
        typeof data === 'object' &&
        data !== null &&
        Array.isArray(data.metas)
    );
}


// --- 3. The StremioAddonClient Class ---

export class StremioAddonClient {
    public baseUrl: string;
    private manifest: Manifest | null = null;
    private requestTimeoutMs: number = 5000; // 5 seconds timeout

    constructor(baseUrl: string) {
        // Sanitize URL: remove trailing slashes
        this.baseUrl = baseUrl.replace(/\/+$/, '');
    }

    /**
     * Fetches and validates the manifest.
     * Caches the result in `this.manifest`.
     */
    async getManifest(): Promise<Manifest | null> {
        try {
            const url = `${this.baseUrl}/manifest.json`;
            const data = await this.fetchWithTimeout(url);

            if (isValidManifest(data)) {
                this.manifest = data;
                return data;
            } else {
                this.logError('ManifestValidation', 'Invalid manifest structure', { url });
                return null;
            }
        } catch (error) {
            this.logError('NetworkError', 'Failed to fetch manifest', { url: this.baseUrl, error });
            return null;
        }
    }

    /**
     * Fetches streams for a specific type and id.
     * Validates if the addon supports streams for this type.
     */
    async getStreams(type: string, id: string): Promise<Stream[]> {
        if (!this.manifest) {
            const manifest = await this.getManifest();
            if (!manifest) return [];
        }

        if (!this.supportsResource('stream', type, id)) {
            // Addon explicitly doesn't support this, so return empty silently or log debug
            return [];
        }

        const url = this.buildUrl('stream', type, id);
        try {
            const data = await this.fetchWithTimeout(url);
            if (isValidStreamList(data)) {
                // Enforce that streams have at least a URL or externalUrl or infoHash
                return data.streams.filter(s => s.url || s.externalUrl || s.infoHash || s.ytId);
            } else {
                this.logError('ResponseValidation', 'Invalid streams response', { url });
                return [];
            }
        } catch (error) {
            this.logError('NetworkError', 'Failed to fetch streams', { url, error });
            return [];
        }
    }

    /**
     * Fetches meta details for a specific item.
     */
    async getMeta(type: string, id: string): Promise<MetaDetail | null> {
        if (!this.manifest) {
            await this.getManifest();
        }

        if (!this.supportsResource('meta', type, id)) {
            return null;
        }

        const url = this.buildUrl('meta', type, id);
        try {
            const data = await this.fetchWithTimeout(url);
            if (isValidMeta(data)) {
                return data.meta;
            } else {
                this.logError('ResponseValidation', 'Invalid meta response', { url });
                return null;
            }
        } catch (error) {
            this.logError('NetworkError', 'Failed to fetch meta', { url, error });
            return null;
        }
    }

    /**
     * Fetches a catalog (list of items).
     */
    async getCatalog(type: string, id: string, extraArgs?: string): Promise<CatalogItem[]> {
        if (!this.manifest) {
            await this.getManifest();
        }

        // Note: Catalog support logic is slightly different, usually checked against manifest.catalogs directly
        // But for simplicity/standardization we'll assume the caller knows what they are asking or we check resource 'catalog'
        if (!this.supportsResource('catalog', type)) {
            return [];
        }

        const url = this.buildUrl('catalog', type, id, extraArgs);
        try {
            const data = await this.fetchWithTimeout(url);
            if (isValidCatalog(data)) {
                return data.metas;
            } else {
                this.logError('ResponseValidation', 'Invalid catalog response', { url });
                return [];
            }
        } catch (error) {
            this.logError('NetworkError', 'Failed to fetch catalog', { url, error });
            return [];
        }
    }


    /**
     * Checks if the addon supports a specific resource and type.
     */
    public supportsResource(resource: string, type: string, id?: string): boolean {
        if (!this.manifest) return false;

        // 1. Check if resource is listed
        const resourceDef = this.manifest.resources.find(r => {
            if (typeof r === 'string') return r === resource;
            return r.name === resource;
        });

        if (!resourceDef) return false;

        // 2. Check types if explicitly defined in resource object
        // If strict resource filtering is needed:
        if (typeof resourceDef === 'object' && resourceDef.types) {
            if (!resourceDef.types.includes(type)) return false;
        } else {
            // Check global types if not in resource
            if (!this.manifest.types.includes(type)) return false;
        }

        // 3. Check idPrefixes if applicable
        if (id && typeof resourceDef === 'object' && resourceDef.idPrefixes) {
            // If prefixes are defined, ID MUST start with one of them
            const hasMatch = resourceDef.idPrefixes.some(prefix => id.startsWith(prefix));
            if (!hasMatch) return false;
        } else if (id && this.manifest.idPrefixes) {
            const hasMatch = this.manifest.idPrefixes.some(prefix => id.startsWith(prefix));
            if (!hasMatch) return false;
        }

        return true;
    }

    /**
     * Constructs the URL following Stremio protocol.
     * Format: /resource/type/id[/extra].json
     */
    private buildUrl(resource: string, type: string, id: string, extraArgs?: string): string {
        // Some implementations might use ID as 'id.json' or just 'id' depending on extra.
        // Standard: base/resource/type/id.json or base/resource/type/id/extra.json

        let path = `${resource}/${type}/${encodeURIComponent(id)}`;

        if (extraArgs) {
            path += `/${extraArgs}`;
        }

        path += '.json';
        return `${this.baseUrl}/${path}`;
    }

    /**
     * Helper Request method with Timeout and Parsing
     */
    private async fetchWithTimeout(url: string): Promise<any> {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), this.requestTimeoutMs);

        try {
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(id);

            if (!response.ok) {
                throw new Error(`HTTP Error ${response.status}`);
            }

            return await response.json();
        } catch (error: any) {
            clearTimeout(id);
            if (error.name === 'AbortError') {
                throw new Error('Request timed out');
            }
            throw error;
        }
    }

    getAddonName(): string {
        return this.manifest?.name || this.baseUrl;
    }

    private logError(type: string, message: string, context: any) {
        console.error(`[StremioClient] Error:`, {
            type,
            message,
            addon: this.baseUrl,
            context
        });
    }
}

// --- 4. The AddonManager Class (Aggregator) ---

export class AddonManager {
    private clients: StremioAddonClient[] = [];

    constructor(addonUrls: string[]) {
        this.clients = addonUrls.map(url => new StremioAddonClient(url));
    }

    addAddon(url: string) {
        // Avoid duplicates
        if (!this.clients.find(c => c.baseUrl === url)) {
            this.clients.push(new StremioAddonClient(url));
        }
    }

    removeAddon(url: string) {
        this.clients = this.clients.filter(c => c.baseUrl !== url);
    }

    /**
     * Initializes all addons by fetching their manifests.
     * Useful to call on app startup.
     */
    async init() {
        await Promise.allSettled(this.clients.map(c => c.getManifest()));
    }

    /**
     * Aggregates streams from all addons.
     * - Parallel execution
     * - Fail-safe (one failure doesn't stop others)
     * - Flattened results
     */
    async getAllStreams(type: string, id: string): Promise<Stream[]> {
        const promises = this.clients.map(async (client) => {
            try {
                const streams = await client.getStreams(type, id);
                // Optionally: enrich streams with source addon name
                return streams.map(s => ({
                    ...s,
                    _addonName: client.getAddonName() // Internal flag for UI if needed
                }));
            } catch (e) {
                // Individual client errors are already logged in the client class
                // We just return empty here to ensure Promise.all works smoothly if we used it, 
                // but we are using map + await inside wrapper.
                return [];
            }
        });

        // Wait for all to finish
        const results = await Promise.all(promises);

        // Flatten arrays: [[s1, s2], [], [s3]] -> [s1, s2, s3]
        return results.flat();
    }

    /**
      * Aggregates catalogs ? (Optional per user requirement, but good to have)
      * Taking a specific catalog from a specific addon is usually how it works, 
      * but for "Search", we might aggregate.
      */
}

// --- 5. Helper Functions for Addon Management ---

/**
 * Normalizes a Stremio Addon URL.
 * 1. Trims whitespace.
 * 2. Replaces stremio:// with https://
 * 3. Ensures it points to /manifest.json for validation purposes.
 */
export function normalizeAddonUrl(input: string): string {
    let url = input.trim();

    // Protocol Fix
    if (url.startsWith('stremio://')) {
        url = url.replace('stremio://', 'https://');
    }

    // Attempt to be smart: if no protocol, assume https
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
    }

    // Edge case: Remove trailing slash if it exists before appending or checking
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }

    // Manifest Fix: If it doesn't end with manifest.json, append it.
    // Note: Stremio links often look like "https://addon.com/manifest.json" or just "https://addon.com"
    // We want the full path to the manifest.
    if (!url.endsWith('/manifest.json')) {
        url = `${url}/manifest.json`;
    }

    return url;
}

/**
 * Validates a Stremio Addon URL.
 * returns { manifest, transportUrl } or throws error.
 */
export async function validateStremioAddon(inputUrl: string): Promise<{ manifest: Manifest, transportUrl: string }> {
    const url = normalizeAddonUrl(inputUrl);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to connect: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && !contentType.includes('application/json')) {
            throw new Error('Invalid content type: Expected JSON');
        }

        const data = await response.json();

        if (!isValidManifest(data)) {
            throw new Error('Invalid Manifest: Missing required fields (id, name, version, resources, types).');
        }

        // The transportUrl is the baseUrl without /manifest.json
        const transportUrl = url.replace('/manifest.json', '');

        return { manifest: data, transportUrl };
    } catch (error: any) {
        // Enhance error message for UI
        console.error('[StremioValidation]', error);
        throw new Error(error.message || 'Unknown validation error');
    }
}
