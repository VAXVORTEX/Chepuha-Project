import { supabase } from './supabaseClient';
import type { StorySheet, StorySheetStatus } from './types';

export interface CreateStorySheetPayload {
    game_session_id?: string;
    player_id?: string;
    sheet_number?: number;
    storysheets_status?: StorySheetStatus;
    final_story?: string;
    current_ai_question?: string | null;
}

export async function createStorySheetsBatch(payloads: CreateStorySheetPayload[]): Promise<StorySheet[]> {
    const { data, error } = await supabase
        .from('story_sheets')
        .insert(payloads)
        .select();
    if (error) throw error;
    return data || [];
}

export async function getStorySheetsBySession(sessionId: string): Promise<StorySheet[]> {
    const { data, error } = await supabase
        .from('story_sheets')
        .select('*, player_id(*), answers(*, player_id(*))')
        .eq('game_session_id', sessionId)
        .order('sheet_number', { ascending: true });
    if (error) throw error;
    return data || [];
}

export async function updateStorySheetQuestion(id: string, question: string | null): Promise<void> {
    const { error } = await supabase
        .from('story_sheets')
        .update({ current_ai_question: question })
        .eq('id', id);
    if (error) throw error;
}