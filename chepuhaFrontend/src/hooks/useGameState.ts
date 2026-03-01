import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../api/supabaseClient';
import {
    getGameSession,
    getPlayersBySession,
    type GameSession,
    type Player,
} from '../api';
interface GameState {
    session: GameSession | null;
    players: Player[];
    error: string | null;
}
export function useGameState(sessionId: string | null) {
    const [gameState, setGameState] = useState<GameState>({
        session: null,
        players: [],
        error: null,
    });
    const fetchState = useCallback(async () => {
        if (!sessionId) return;
        try {
            const [sessionData, playersData] = await Promise.all([
                getGameSession(sessionId),
                getPlayersBySession(sessionId),
            ]);
            setGameState({
                session: sessionData,
                players: playersData,
                error: null,
            });
        } catch (err) {
            setGameState((prev) => ({ ...prev, error: 'Втрачено звʼязок з сервером' }));
        }
    }, [sessionId]);
    useEffect(() => {
        fetchState();
        if (!sessionId) return;

        const sessionChannel = supabase
            .channel(`session-${sessionId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'game_sessions', filter: `id=eq.${sessionId}` },
                (payload) => { if (payload) fetchState(); }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'players', filter: `session_id=eq.${sessionId}` },
                (payload) => { if (payload) fetchState(); }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'rounds', filter: `session_id=eq.${sessionId}` },
                (payload) => { if (payload) fetchState(); }
            )
            .subscribe((status) => {
                console.log(`Realtime subscription status for session ${sessionId}:`, status);
            });

        const pollInterval = setInterval(() => {
            fetchState();
        }, 3000);

        return () => {
            supabase.removeChannel(sessionChannel);
            clearInterval(pollInterval);
        };
    }, [fetchState, sessionId]);
    return {
        ...gameState,
        refreshState: fetchState,
    };
}
