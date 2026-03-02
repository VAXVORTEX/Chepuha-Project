import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key is missing from .env file.');
}

const fetchWithRetry = async (url: string | URL | Request, options?: RequestInit, retries = 4): Promise<Response> => {
    try {
        const response = await fetch(url, options);
        if (!response.ok && response.status >= 500 && retries > 0) {
            const delay = Math.pow(2, 4 - retries) * 1000; // Exponential: 1s, 2s, 4s, 8s
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(url, options, retries - 1);
        }
        return response;
    } catch (err) {
        if (retries > 0) {
            const delay = Math.pow(2, 4 - retries) * 1000;
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
