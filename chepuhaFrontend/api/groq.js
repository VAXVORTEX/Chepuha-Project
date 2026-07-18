export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'GROQ API KEY is not configured on the server.' });
    }

    const { messages, maxTokens, seed, requireJson, temperature } = req.body;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: messages || [],
                max_tokens: maxTokens || 800,
                temperature: temperature ?? 0.8,
                seed: seed,
                ...(requireJson ? { response_format: { type: "json_object" } } : {})
            })
        });

        if (!response.ok) {
            const err = await response.text();
            return res.status(response.status).json({ error: err });
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim() || '';
        return res.status(200).json({ content });

    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}
