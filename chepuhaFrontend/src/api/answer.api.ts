import { apiClient } from './apiClient';
import type { StrapiResponse, StrapiListResponse, Answer } from './types';
export interface SubmitAnswerPayload {
    answer_id?: string;
    answer_text: string;
    position_in_sheet: number;
    player?: string;
    round?: string;
    story_sheet?: string;
}
export async function submitAnswer(payload: SubmitAnswerPayload): Promise<Answer> {
    const res = await apiClient.post<StrapiResponse<Answer>>('/answers', payload);
    return res.data as unknown as Answer;
}
export async function getAnswer(documentId: string): Promise<Answer> {
    const res = await apiClient.get<StrapiResponse<Answer>>(`/answers/${documentId}?populate=*`);
    return res.data as unknown as Answer;
}
export async function getAnswersByRound(roundDocumentId: string): Promise<Answer[]> {
    const res = await apiClient.get<StrapiListResponse<Answer>>(`/answers?filters[round][$eq]=${roundDocumentId}&populate=*`);
    return res.data as unknown as Answer[];
}
export async function getAnswersByStorySheet(storySheetDocumentId: string): Promise<Answer[]> {
    const res = await apiClient.get<StrapiListResponse<Answer>>(`/answers?filters[story_sheet][$eq]=${storySheetDocumentId}&populate=*`);
    return res.data as unknown as Answer[];
}
