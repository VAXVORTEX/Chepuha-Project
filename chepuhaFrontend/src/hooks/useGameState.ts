import { useState, useEffect, useCallback } from 'react';
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
export function useGameState(sessionId: number | null) {
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
        const intervalId = setInterval(fetchState, 1000);
        return () => clearInterval(intervalId);
    }, [fetchState, sessionId]);
    return {
        ...gameState,
        refreshState: fetchState,
    };
}
