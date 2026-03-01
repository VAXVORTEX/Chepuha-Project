import { supabase } from './supabaseClient';
import type { Answer } from './types';

export interface SubmitAnswerPayload {
    answer_text: string;
    position_in_sheet: number;
    player_id?: number;
    round_id?: number;
    story_sheet_id?: number;
}

export async function submitAnswer(payload: SubmitAnswerPayload): Promise<Answer> {
    const { data, error } = await supabase
        .from('answers')
        .insert(payload)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function getAnswer(id: number): Promise<Answer> {
    const { data, error } = await supabase
        .from('answers')
        .select('*')
        .eq('id', id)
        .single();
    if (error) throw error;
    return data;
}

export async function getAnswersByRound(roundId: number): Promise<Answer[]> {
    const { data, error } = await supabase
        .from('answers')
        .select('*')
        .eq('round_id', roundId)
        .order('position_in_sheet', { ascending: true });
    if (error) throw error;
    return data;
}

export async function getAnswersByStorySheet(storySheetId: number): Promise<Answer[]> {
    const { data, error } = await supabase
        .from('answers')
        .select('*')
        .eq('story_sheet_id', storySheetId)
        .order('position_in_sheet', { ascending: true });
    if (error) throw error;
    return data;
}
