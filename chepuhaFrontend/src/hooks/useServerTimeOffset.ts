import { useState, useEffect } from 'react';

export const useServerTimeOffset = () => {
  const [serverTimeOffset, setServerTimeOffset] = useState(0);

  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) return;
    
    fetch(`${supabaseUrl}/auth/v1/health`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey
      }
    })
      .then(res => {
        const dateHeader = res.headers.get('date');
        if (dateHeader) {
          const sTime = Date.parse(dateHeader);
          if (!isNaN(sTime)) {
            setServerTimeOffset(Date.now() - sTime);
          }
        }
      })
      .catch(err => {
        console.warn("Failed to fetch server time offset:", err);
      });
  }, []);

  return serverTimeOffset;
};
