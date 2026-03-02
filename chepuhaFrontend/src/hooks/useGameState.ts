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
            let sessionData = gameState.session;
            let playersData = gameState.players;
            let roundsData = gameState.rounds;

            try { sessionData = await getGameSession(sessionId); } catch (e) { console.error("Session fetch failed", e); }
            try { playersData = await getPlayersBySession(sessionId); } catch (e) { console.error("Players fetch failed", e); }
            try { roundsData = await getRoundsBySession(sessionId); } catch (e) { console.error("Rounds fetch failed", e); }

            let activeRoundAnswers: Answer[] = gameState.currentAnswers;
            const sortedByNum = Array.isArray(roundsData) ? [...roundsData].sort((a: any, b: any) => (b.round_number || 0) - (a.round_number || 0)) : [];
            const activeRound = sortedByNum.length > 0 ? sortedByNum[0] : null;

            if (activeRound) {
                try {
                    activeRoundAnswers = await getAnswersByRound(activeRound.id);
                } catch (e) {
                    console.error("Answers fetch failed", e);
                }
            }

            // Aggressive fallback: if fetch failed, use previous state data to avoid flashing empty screens
            setGameState((prev) => ({
                session: sessionData || prev.session,
                players: playersData || prev.players,
                rounds: roundsData || prev.rounds,
                activeRoundId: activeRound?.id || null,
                currentAnswers: activeRoundAnswers || [],
                error: null,
            }));
        } catch (err: any) {
            // Overall failure (e.g. initial connection)
            if (err instanceof TypeError || String(err).includes('Failed to fetch')) {
                setGameState((prev) => ({ ...prev, error: 'NETWORK_ERROR' }));
            }
        }
    }, [sessionId]);

    useEffect(() => {
        fetchState();
        if (!sessionId) return;

        try {
            const sessionChannel = supabase
                .channel(`session-${sessionId}`)
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'game_sessions', filter: `id=eq.${sessionId}` },
                    () => { fetchState(); }
                )
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'players', filter: `session_id=eq.${sessionId}` },
                    () => { fetchState(); }
                )
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'rounds', filter: `session_id=eq.${sessionId}` },
                    () => { fetchState(); }
                )
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'answers' },
                    () => { fetchState(); }
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
        } catch (err) {
            console.error("Realtime subscription failed, using polling only", err);
            const pollInterval = setInterval(() => {
                fetchState();
            }, 1000);
            return () => clearInterval(pollInterval);
        }
    }, [fetchState, sessionId]);

    return {
        ...gameState,
        refreshState: fetchState,
    };
}
