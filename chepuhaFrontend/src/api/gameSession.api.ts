import { apiClient } from './apiClient';
import type { StrapiResponse, StrapiListResponse, GameSession, SessionStatus } from './types';
export interface CreateGameSessionPayload {
    session_id?: string;
    session_name?: string;
    max_players?: number;
    session_status?: SessionStatus;
    current_players_count?: number;
    template?: string;
}
export async function createGameSession(payload: CreateGameSessionPayload): Promise<GameSession> {
    const res = await apiClient.post<StrapiResponse<GameSession>>('/game-sessions', payload);
    return res.data as unknown as GameSession;
}
export async function getGameSession(documentId: string): Promise<GameSession> {
    const res = await apiClient.get<StrapiResponse<GameSession>>(`/game-sessions/${documentId}?populate=*`);
    return res.data as unknown as GameSession;
}
export async function getGameSessions(): Promise<GameSession[]> {
    const res = await apiClient.get<StrapiListResponse<GameSession>>('/game-sessions?populate=*');
    return res.data as unknown as GameSession[];
}
export async function updateGameSession(
    documentId: string,
    payload: Partial<CreateGameSessionPayload>,
): Promise<GameSession> {
    const res = await apiClient.put<StrapiResponse<GameSession>>(`/game-sessions/${documentId}`, payload);
    return res.data as unknown as GameSession;
}
export async function deleteGameSession(documentId: string): Promise<void> {
    await apiClient.delete(`/game-sessions/${documentId}`);
}
