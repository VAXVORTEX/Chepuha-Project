import { supabase } from './supabaseClient';
import type { GameSession, SessionStatus } from './types';

export interface CreateGameSessionPayload {
    session_name?: string;
    max_players?: number;
    session_status?: SessionStatus;
    current_players_count?: number;
    template?: string;
}

export async function createGameSession(payload: CreateGameSessionPayload): Promise<GameSession> {
    const { data, error } = await supabase
        .from('game_sessions')
        .insert(payload)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function getGameSession(id: string): Promise<GameSession> {
    const { data, error } = await supabase
        .from('game_sessions')
        .select(`
            *,
            players (*),
            rounds (*),
            story_sheets (*)
        `)
        .eq('id', id)
        .single();
    if (error) throw error;
    return data;
}

export async function getGameSessions(): Promise<GameSession[]> {
    const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .order('id', { ascending: false });
    if (error) throw error;
    return data;
}

export async function updateGameSession(
    id: string,
    payload: Partial<CreateGameSessionPayload>,
): Promise<GameSession> {
    const { data, error } = await supabase
        .from('game_sessions')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteGameSession(id: string): Promise<void> {
    const { error } = await supabase
        .from('game_sessions')
        .delete()
        .eq('id', id);
    if (error) throw error;
}
