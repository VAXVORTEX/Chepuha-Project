import { apiClient } from './apiClient';
import type { StrapiResponse, StrapiListResponse, Player, PlayerStatus } from './types';
export interface CreatePlayerPayload {
    player_id?: string;
    nickname: string;
    session_id?: string;
    players_status?: PlayerStatus;
    player_order?: number;
}
export async function createPlayer(payload: CreatePlayerPayload): Promise<Player> {
    const res = await apiClient.post<StrapiResponse<Player>>('/players', payload);
    return res.data as unknown as Player;
}
export async function getPlayer(documentId: string): Promise<Player> {
    const res = await apiClient.get<StrapiResponse<Player>>(`/players/${documentId}?populate=*`);
    return res.data as unknown as Player;
}
export async function getPlayersBySession(sessionDocumentId: string): Promise<Player[]> {
    const res = await apiClient.get<StrapiListResponse<Player>>(`/players?filters[session_id][$eq]=${sessionDocumentId}&populate=*`);
    return res.data as unknown as Player[];
}
export async function updatePlayer(documentId: string, payload: Partial<CreatePlayerPayload>): Promise<Player> {
    const res = await apiClient.put<StrapiResponse<Player>>(`/players/${documentId}`, payload);
    return res.data as unknown as Player;
}
export async function deletePlayer(documentId: string): Promise<void> {
    await apiClient.delete(`/players/${documentId}`);
}
