import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../api/supabaseClient';
import {
    getGameSession,
    getPlayersBySession,
    getRoundsBySession,
    getAnswersByRound,
    type GameSession,
    type Player,
    type Round,
    type Answer,
} from '../api';

interface GameState {
    session: GameSession | null;
    players: Player[];
    rounds: Round[];
    activeRoundId: string | null;
    currentAnswers: Answer[];
    error: string | null;
}

export function useGameState(sessionId: string | null) {
    const [gameState, setGameState] = useState<GameState>({
        session: null,
        players: [],
        rounds: [],
        activeRoundId: null,
        currentAnswers: [],
        error: null,
    });

    const fetchState = useCallback(async () => {
        if (!sessionId) return;
        try {
            // Sequential fetching is more resilient on VPNs/DPI than Promise.all
            const sessionData = await getGameSession(sessionId);
            const playersData = await getPlayersBySession(sessionId);
            const roundsData = await getRoundsBySession(sessionId);

            let activeRoundAnswers: Answer[] = [];
            const sortedByNum = Array.isArray(roundsData) ? [...roundsData].sort((a: any, b: any) => (b.round_number || 0) - (a.round_number || 0)) : [];
            const activeRound = sortedByNum.length > 0 ? sortedByNum[0] : null;

            if (activeRound) {
                activeRoundAnswers = await getAnswersByRound(activeRound.id);
            }

            setGameState({
                session: sessionData,
                players: playersData || [],
                rounds: roundsData || [],
                activeRoundId: activeRound?.id || null,
                currentAnswers: activeRoundAnswers || [],
                error: null,
            });
        } catch (err: any) {
            // Detect fetch (network) failures
            if (err instanceof TypeError || String(err).includes('Failed to fetch')) {
                setGameState((prev) => ({ ...prev, error: 'NETWORK_ERROR' }));
            } else {
                setGameState((prev) => ({ ...prev, error: 'Втрачено звʼязок з сервером' }));
            }
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
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'answers' },
                (payload) => { if (payload) fetchState(); }
            )
            .subscribe((status) => {
                console.log(`Realtime subscription status for session ${sessionId}:`, status);
            });

        const pollInterval = setInterval(() => {
            fetchState();
        }, 1000); // 1s polling fallback for faster sync

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
