import { supabase } from './supabaseClient';
import type { Player, PlayerStatus } from './types';

export interface CreatePlayerPayload {
    nickname: string;
    session_id?: string;
    players_status?: PlayerStatus;
    player_order?: number;
    color?: string;
}

export async function createPlayer(payload: CreatePlayerPayload): Promise<Player> {
    const { data, error } = await supabase
        .from('players')
        .insert(payload)
        .select()
        .single();

    if (error) throw error;
    return data as Player;
}

export async function getPlayer(id: string): Promise<Player> {
    const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data as Player;
}

export async function getPlayersBySession(sessionId: string): Promise<Player[]> {
    const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('session_id', sessionId)
        .order('id', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function updatePlayer(id: string, payload: Partial<CreatePlayerPayload>): Promise<Player> {
    const { data, error } = await supabase
        .from('players')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as Player;
}

export async function updatePlayersBySession(
    sessionId: string,
    payload: Partial<CreatePlayerPayload>,
): Promise<void> {
    const { error } = await supabase
        .from('players')
        .update(payload)
        .eq('session_id', sessionId);
    if (error) throw error;
}

export async function deletePlayer(id: string): Promise<void> {
    const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
