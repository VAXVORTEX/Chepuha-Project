import { supabase } from './supabaseClient';
import type { Round, QuestionType, RoundStatus } from './types';

export interface CreateRoundPayload {
    session_id?: string;
    round_number: number;
    question_type: QuestionType;
    rounds_status?: RoundStatus;
    started_at?: string;
}

export async function createRound(payload: CreateRoundPayload): Promise<Round> {
    const { data, error } = await supabase
        .from('rounds')
        .insert(payload)
        .select()
        .single();
    if (error) throw error;
    return data as Round;
}

export async function getRound(id: string): Promise<Round> {
    const { data, error } = await supabase
        .from('rounds')
        .select('*, answers(*)')
        .eq('id', id)
        .single();
    if (error) throw error;
    return data as Round;
}

export async function getRoundsBySession(sessionId: string): Promise<Round[]> {
    const { data, error } = await supabase
        .from('rounds')
        .select('*, answers(*)')
        .eq('session_id', sessionId)
        .order('round_number', { ascending: true });
    if (error) throw error;
    return data || [];
}

export async function updateRound(
    id: string,
    payload: Partial<CreateRoundPayload & { completed_at: string }>,
): Promise<Round> {
    const { data, error } = await supabase
        .from('rounds')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data as Round;
}
