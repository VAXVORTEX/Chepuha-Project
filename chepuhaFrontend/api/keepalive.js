export default async function handler(req, res) {
    // В Vercel серверні функції мають доступ до process.env
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        return res.status(500).json({ error: 'Missing Supabase credentials' });
    }

    try {
        // Робимо справжній запит до БД: читаємо лише 1 рядок з таблиці games
        // Це гарантовано реєструється як активність бази даних у Supabase
        const response = await fetch(`${SUPABASE_URL}/rest/v1/games?select=id&limit=1`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Supabase returned status ${response.status}`);
        }

        const data = await response.json();
        
        return res.status(200).json({ 
            status: 'success', 
            message: 'Supabase pinged successfully with real DB query',
            dataCount: data.length
        });
    } catch (error) {
        console.error('Keepalive error:', error);
        return res.status(500).json({ error: error.message });
    }
}
