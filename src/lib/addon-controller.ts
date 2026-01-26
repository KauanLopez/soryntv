
import { createClient } from '@supabase/supabase-js'

// In a real Edge Function, these would be in Deno.env
// For this standalone file, we'll assume they are available or passed in
const SUPABASE_URL = process.env.SUPABASE_URL || 'your-supabase-url';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key';

// Initialize Supabase Client (Service Role is needed for broader access if strict RLS is tricky, 
// but here we can just pass the user's auth token if we were in a request context.
// For "Controller" simulation, we'll assume we verify the user's JWT first).

interface InstallAddonRequest {
    userId: string; // Extracted from Auth Context
    url: string; // The Transport URL
}

interface Manifest {
    id: string;
    name: string;
    logo?: string;
    version?: string;
    [key: string]: any;
}

export const installAddon = async (request: InstallAddonRequest) => {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { userId, url } = request;

    if (!url) {
        throw new Error('URL is required');
    }

    // 1. Server-Side Validation: Fetch the manifest
    console.log(`[Server] Validating addon URL: ${url}`);

    let manifest: Manifest;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch addon manifest: ${response.statusText}`);
        }
        manifest = await response.json();
    } catch (err) {
        throw new Error(`Invalid Addon URL or Server Unreachable: ${err.message}`);
    }

    if (!manifest.id || !manifest.name) {
        throw new Error('Invalid manifest: missing required fields (id or name)');
    }

    // 2. Extract Data
    const addonId = manifest.id;
    const name = manifest.name;
    // Use a default logo if none provided? Or just store null.
    const logo = manifest.logo || null;
    const version = manifest.version || '0.0.0';

    console.log(`[Server] Manifest valid. ID: ${addonId}, Name: ${name}`);

    // 3. Duplicate Check
    // We check if this exact configuration (transportUrl) exists for this user.
    // The unique constraint in DB handles this, but a nice error message is better.
    const { data: existing } = await supabase
        .from('user_addons')
        .select('id')
        .eq('user_id', userId)
        .eq('transport_url', url)
        .single();

    if (existing) {
        throw new Error('This specific addon configuration is already installed.');
    }

    // 4. Persist
    const { data, error } = await supabase
        .from('user_addons')
        .insert({
            user_id: userId,
            transport_url: url,
            manifest_url: url, // In a real scenario, you might parse this to remove /conf/.../
            addon_id: addonId,
            name,
            logo,
            version
        })
        .select()
        .single();

    if (error) {
        throw new Error(`Database Error: ${error.message}`);
    }

    return data;
};

// --- Optimization Explanation ---
// Why Cache 'name' and 'logo'?
// 1. **Performance**: Reduces the need to make external HTTP requests to addon servers
//    every time the dashboard loads.
// 2. **Resilience**: If an addon server is temporary down, the user's dashboard
//    still loads correctly without broken images or missing names.
// 3. **Bandwidth**: Saves user data and reduces latency (fetching 10 JSONs vs 1 DB query).
