import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@api/supabaseClient';
import {
    getGameSession,
    getPlayersBySession,
    getRoundsBySession,
    getAnswersByRound,
    type GameSession,
    type Player,
    type Round,
    type Answer,
} from '@api';

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

    const fetchLock = useRef(false);

    const fetchState = useCallback(async () => {
        if (!sessionId || fetchLock.current) return;
        fetchLock.current = true;
        try {

            const [sessionData, playersData, roundsData] = await Promise.all([
                getGameSession(sessionId).catch(() => gameState.session),
                getPlayersBySession(sessionId).catch(() => gameState.players),
                getRoundsBySession(sessionId).catch(() => gameState.rounds),
            ]);

            let activeRoundAnswers: Answer[] = gameState.currentAnswers;
            const sortedByNum = Array.isArray(roundsData) ? [...roundsData].sort((a: any, b: any) => (b.round_number || 0) - (a.round_number || 0)) : [];
            const activeRound = sortedByNum.length > 0 ? sortedByNum[0] : null;

            if (activeRound) {

                if (activeRound.id !== gameState.activeRoundId) {
                    activeRoundAnswers = [];
                }
                try {
                    activeRoundAnswers = await getAnswersByRound(activeRound.id);
                } catch (e) {
                }
            }

            setGameState((prev) => {
                const newState = {
                    session: sessionData || prev.session,
                    players: playersData || prev.players,
                    rounds: roundsData || prev.rounds,
                    activeRoundId: activeRound?.id || null,
                    currentAnswers: activeRoundAnswers || [],
                    error: null,
                    dataReady: true,
                };
                
                if (JSON.stringify(prev) === JSON.stringify(newState)) {
                    return prev;
                }
                return newState;
            });
        } catch (err: any) {

            if (err instanceof TypeError || String(err).includes('Failed to fetch')) {
                setGameState((prev) => ({ ...prev, error: 'NETWORK_ERROR' }));
            }
        } finally {
            fetchLock.current = false;
        }
    }, [sessionId]);

    useEffect(() => {

        setGameState({
            session: null,
            players: [],
            rounds: [],
            activeRoundId: null,
            currentAnswers: [],
            error: null,
            dataReady: false,
        });

        if (!sessionId) return;
        fetchState();

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
                        if (!payload) return;
                        if (payload.new) {
                            setGameState(prev => {
                                const newPlayer = payload.new as any;
                                const exists = prev.players.some(p => p.id === newPlayer.id);
                                return { ...prev, players: exists ? prev.players.map(p => p.id === newPlayer.id ? newPlayer : p) : [...prev.players, newPlayer] };
                            });
                        }
                        if (payload.eventType === 'DELETE' && payload.old) {
                            setGameState(prev => ({ ...prev, players: prev.players.filter(p => p.id !== (payload.old as any).id) }));
                        }
                    }
                )
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'rounds', filter: `session_id=eq.${sessionId}` },
                    (payload) => {
                        if (payload?.new) {
                            const newRound = payload.new as any;
                            setGameState(prev => {
                                const exists = prev.rounds.some(r => r.id === newRound.id);
                                const updatedRounds = exists ? prev.rounds.map(r => r.id === newRound.id ? newRound : r) : [...prev.rounds, newRound];
                                const sorted = [...updatedRounds].sort((a: any, b: any) => (b.round_number || 0) - (a.round_number || 0));
                                const activeRound = sorted[0] || null;
                                return {
                                    ...prev,
                                    rounds: updatedRounds,
                                    activeRoundId: activeRound?.id || prev.activeRoundId,
                                    currentAnswers: activeRound?.id !== prev.activeRoundId ? [] : prev.currentAnswers,
                                };
                            });
                        }
                        if (payload) fetchState();
                    }
                )
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'answers' },
                    (payload) => {
                        if (payload?.new && payload?.eventType === 'INSERT') {
                            const newAnswer = payload.new as any;
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
                    }
                )
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        setGameState((prev) => ({ ...prev, error: null }));
                    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
                        // Let realtime auto-reconnect handle it, but fetch state explicitly to avoid desync
                        fetchState();
                    }
                });

            // 1. Fallback polling interval in case websocket goes silently dead (common on mobile)
            const fallbackInterval = setInterval(() => {
                fetchState();
            }, 10000); // 10 seconds

            // 2. Visibility change to immediately sync when returning to app
            const handleVisibilityChange = () => {
                if (document.visibilityState === 'visible') {
                    fetchState();
                }
            };
            document.addEventListener('visibilitychange', handleVisibilityChange);

            return () => {
                clearInterval(fallbackInterval);
                document.removeEventListener('visibilitychange', handleVisibilityChange);
                supabase.removeChannel(sessionChannel);
            };
        } catch (err) {
            const pollInterval = setInterval(() => {
                fetchState();
            }, 1500);
            return () => clearInterval(pollInterval);
        }
    }, [fetchState, sessionId]);

    return {
        ...gameState,
        refreshState: fetchState,
    };
}