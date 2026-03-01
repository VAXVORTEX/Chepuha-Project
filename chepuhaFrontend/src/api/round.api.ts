import { apiClient } from './apiClient';
import type { StrapiResponse, StrapiListResponse, Round, QuestionType, RoundStatus } from './types';
export interface CreateRoundPayload {
    round_id?: string;
    session_id?: string;
    round_number: number;
    question_type: QuestionType;
    rounds_status?: RoundStatus;
    started_at?: string;
}
export async function createRound(payload: CreateRoundPayload): Promise<Round> {
    const res = await apiClient.post<StrapiResponse<Round>>('/rounds', payload);
    return res.data as unknown as Round;
}
export async function getRound(documentId: string): Promise<Round> {
    const res = await apiClient.get<StrapiResponse<Round>>(`/rounds/${documentId}?populate=*`);
    return res.data as unknown as Round;
}
export async function getRoundsBySession(sessionDocumentId: string): Promise<Round[]> {
    const res = await apiClient.get<StrapiListResponse<Round>>(`/rounds?filters[session_id][$eq]=${sessionDocumentId}&populate=*`);
    return res.data as unknown as Round[];
}
export async function updateRound(
    documentId: string,
    payload: Partial<CreateRoundPayload & { started_at: string; completed_at: string }>,
): Promise<Round> {
    const res = await apiClient.put<StrapiResponse<Round>>(`/rounds/${documentId}`, payload);
    return res.data as unknown as Round;
}
