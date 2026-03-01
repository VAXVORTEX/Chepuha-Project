import { supabase } from './supabaseClient';
import type { StorySheet, StorySheetStatus } from './types';

export interface CreateStorySheetPayload {
    game_session_id?: number;
    player_id?: number;
    sheet_number?: number;
    storysheets_status?: StorySheetStatus;
    final_story?: string;
}

export async function createStorySheet(payload: CreateStorySheetPayload): Promise<StorySheet> {
    const { data, error } = await supabase
        .from('story_sheets')
        .insert(payload)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function getStorySheet(id: number): Promise<StorySheet> {
    const { data, error } = await supabase
        .from('story_sheets')
        .select('*, answers(*)')
        .eq('id', id)
        .single();
    if (error) throw error;
    return data;
}

export async function getStorySheetsBySession(sessionId: number): Promise<StorySheet[]> {
    const { data, error } = await supabase
        .from('story_sheets')
        .select('*, answers(*)')
        .eq('game_session_id', sessionId)
        .order('sheet_number', { ascending: true });
    if (error) throw error;
    return data;
}

export async function updateStorySheet(
    id: number,
    payload: Partial<CreateStorySheetPayload & { storysheets_completed_at?: string }>,
): Promise<StorySheet> {
    const { data, error } = await supabase
        .from('story_sheets')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}
