
const { default: fetch } = await import('node-fetch');
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rrxtcekxpzlomiecmoqy.supabase.co/rest/v1';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyeHRjZWt4cHpsb21pZWNtb3F5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzOTI3MTAsImV4cCI6MjA4Nzk2ODcxMH0.1J0vt4kem6G7ygf73ZWO247dD8rwsc9P5yVvXmWp32k';

async function apiRequest(method, path, body) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
        },
    };
    if (body !== undefined) {
        options.body = JSON.stringify(body);
    }
    const response = await fetch(`${SUPABASE_URL}${path}`, options);
    const text = await response.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch {
        data = text;
    }
    return { status: response.status, data };
}
export default apiRequest;
