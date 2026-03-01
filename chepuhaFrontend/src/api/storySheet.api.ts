import { apiClient } from './apiClient';
import type { StrapiResponse, StrapiListResponse, StorySheet, StorySheetStatus } from './types';
export interface CreateStorySheetPayload {
    sheet_id?: string;
    game_session?: string;
    player?: string;
    sheet_number?: number;
    storysheets_status?: StorySheetStatus;
    final_story?: string;
}
export async function createStorySheet(payload: CreateStorySheetPayload): Promise<StorySheet> {
    const res = await apiClient.post<StrapiResponse<StorySheet>>('/story-sheets', payload);
    return res.data as unknown as StorySheet;
}
export async function getStorySheet(documentId: string): Promise<StorySheet> {
    const res = await apiClient.get<StrapiResponse<StorySheet>>(`/story-sheets/${documentId}?populate=*`);
    return res.data as unknown as StorySheet;
}
export async function getStorySheetsBySession(sessionDocumentId: string): Promise<StorySheet[]> {
    const res = await apiClient.get<StrapiListResponse<StorySheet>>(`/story-sheets?filters[game_session][$eq]=${sessionDocumentId}&populate=*`);
    return res.data as unknown as StorySheet[];
}
export async function updateStorySheet(documentId: string, payload: Partial<CreateStorySheetPayload>): Promise<StorySheet> {
    const res = await apiClient.put<StrapiResponse<StorySheet>>(`/story-sheets/${documentId}`, payload);
    return res.data as unknown as StorySheet;
}
