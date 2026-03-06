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
    dataReady: boolean;
}

export function useGameState(sessionId: string | null) {
    const [gameState, setGameState] = useState<GameState>({
        session: null,
        players: [],
        rounds: [],
        activeRoundId: null,
        currentAnswers: [],
        error: null,
        dataReady: false,
    });

    const fetchState = useCallback(async () => {
        if (!sessionId) return;
        try {
            // Parallel fetching for speed (~200ms vs ~800ms sequential)
            const [sessionData, playersData, roundsData] = await Promise.all([
                getGameSession(sessionId).catch(() => gameState.session),
                getPlayersBySession(sessionId).catch(() => gameState.players),
                getRoundsBySession(sessionId).catch(() => gameState.rounds),
            ]);

            let activeRoundAnswers: Answer[] = gameState.currentAnswers;
            const sortedByNum = Array.isArray(roundsData) ? [...roundsData].sort((a: any, b: any) => (b.round_number || 0) - (a.round_number || 0)) : [];
            const activeRound = sortedByNum.length > 0 ? sortedByNum[0] : null;

            if (activeRound) {
                // If round changed, don't carry over old answers
                if (activeRound.id !== gameState.activeRoundId) {
                    activeRoundAnswers = [];
                }
                try {
                    activeRoundAnswers = await getAnswersByRound(activeRound.id);
                } catch (e) {
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
                dataReady: true,
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
                    (payload) => {
                        if (payload?.new) setGameState(prev => ({ ...prev, session: { ...prev.session, ...payload.new } as any }));
                        fetchState();
                    }
                )
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'players', filter: `session_id=eq.${sessionId}` },
                    (payload) => {
                        if (payload?.new) {
                            setGameState(prev => {
                                const newPlayer = payload.new as any;
                                const exists = prev.players.some(p => p.id === newPlayer.id);
                                return { ...prev, players: exists ? prev.players.map(p => p.id === newPlayer.id ? newPlayer : p) : [...prev.players, newPlayer] };
                            });
                        }
                        if (payload?.eventType === 'DELETE' && payload?.old) {
                            setGameState(prev => ({ ...prev, players: prev.players.filter(p => p.id !== (payload.old as any).id) }));
                        }
                        fetchState();
                    }
                )
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'rounds', filter: `session_id=eq.${sessionId}` },
                    (payload) => {
                        if (payload?.new) {
                            setGameState(prev => {
                                const newRound = payload.new as any;
                                const exists = prev.rounds.some(r => r.id === newRound.id);
                                return { ...prev, rounds: exists ? prev.rounds.map(r => r.id === newRound.id ? newRound : r) : [...prev.rounds, newRound] };
                            });
                        }
                        fetchState();
                    }
                )
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'answers' },
                    (payload) => {
                        if (payload?.new && payload?.eventType === 'INSERT') {
                            const newAnswer = payload.new as any;
                            // Verify if this answer belongs to the active round of our session
                            // Note: Since we don't have session_id directly in 'answers' table, 
                            // we cross-reference with activeRoundId
                            setGameState(prev => {
                                if (prev.activeRoundId && String(newAnswer.round_id) === String(prev.activeRoundId)) {
                                    const exists = prev.currentAnswers.some(a => a.id === newAnswer.id);
                                    return {
                                        ...prev,
                                        currentAnswers: exists ? prev.currentAnswers : [...prev.currentAnswers, newAnswer]
                                    };
                                }
                                return prev;
                            });
                        }
                        if (Date.now() % 5 === 0) fetchState(); // Throttled re-sync
                    }
                )
                .subscribe((status) => {
                });

            const pollInterval = setInterval(() => {
                fetchState();
            }, 1000); // 1s fallback polling

            return () => {
                supabase.removeChannel(sessionChannel);
                clearInterval(pollInterval);
            };
        } catch (err) {
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
