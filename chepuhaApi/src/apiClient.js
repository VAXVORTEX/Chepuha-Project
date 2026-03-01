
const { default: fetch } = await import('node-fetch');
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://irohvtjrzhilbwtnsyxc.supabase.co/rest/v1';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyb2h2dGpyemhpbGJ3dG5zeXhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzODA0MDcsImV4cCI6MjA4Nzk1NjQwN30.33IjOnDDsXu2vyodt8d82oZJx_D_OhUi8rDxfqMOnc4'; // Встав сюди свій anon key

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
