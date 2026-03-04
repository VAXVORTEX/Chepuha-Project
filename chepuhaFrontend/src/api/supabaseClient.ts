import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
}

const fetchWithRetry = async (url: string | URL | Request, options?: RequestInit, retries = 5): Promise<Response> => {
    try {
        const response = await fetch(url, options);
        // Retry on 5xx (server error) AND 403/406 (common DPI/ISP block codes)
        if (!response.ok && (response.status >= 500 || response.status === 403 || response.status === 406) && retries > 0) {
            const delay = Math.pow(2, 5 - retries) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(url, options, retries - 1);
        }
        return response;
    } catch (err) {
        // TypeError is often a network timeout or CORS block
        if (retries > 0) {
            const delay = Math.pow(2, 5 - retries) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(url, options, retries - 1);
        }
        throw err;
    }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
        fetch: fetchWithRetry
    },
    realtime: {
        timeout: 30000,
        heartbeatIntervalMs: 15000
    }
});
