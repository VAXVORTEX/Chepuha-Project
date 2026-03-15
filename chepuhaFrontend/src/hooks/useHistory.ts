import { useState, useEffect } from 'react';
export interface SavedPlayerStory {
    playerName: string;
    story: string;
    answers?: string[];
    templateId?: string;
    playerColor?: string;
}
export interface SavedGame {
    id: string;
    sessionId?: string;
    date: string;
    roomCode: string;
    hostName: string;
    hostColor?: string;
    stories: SavedPlayerStory[];
    timestamp: number;
}
const STORAGE_KEY = 'chepuha_history';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
export function useHistory() {
    const [savedGames, setSavedGames] = useState<SavedGame[]>([]);
    useEffect(() => {
        loadHistory();
    }, []);
    const loadHistory = () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                const parsed: SavedGame[] = JSON.parse(data);
                const now = Date.now();
                const validGames = parsed.filter(g => now - g.timestamp < ONE_DAY_MS);
                if (validGames.length !== parsed.length) {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(validGames));
                }
                setSavedGames(validGames.sort((a, b) => b.timestamp - a.timestamp));
            }
        } catch (e) {
        }
    };
    const saveGameToHistory = (game: Omit<SavedGame, 'id' | 'timestamp'>) => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            let parsed: SavedGame[] = data ? JSON.parse(data) : [];
            if (game.sessionId && parsed.some(g => g.sessionId === game.sessionId)) {
                return;
            }
            const newGame: SavedGame = {
                ...game,
                id: crypto.randomUUID(),
                timestamp: Date.now()
            };
            parsed = [newGame, ...parsed];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
            setSavedGames(parsed);
        } catch (e) {
        }
    };
    return { savedGames, saveGameToHistory, loadHistory };
}
