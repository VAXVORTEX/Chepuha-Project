export interface StrapiResponse<T> {
    data: StrapiItem<T>;
    meta: Record<string, unknown>;
}
export interface StrapiListResponse<T> {
    data: StrapiItem<T>[];
    meta: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}
export interface StrapiItem<T> {
    id: number;
    documentId: string;
    attributes?: T;
    [key: string]: unknown;
}
export type SessionStatus = 'waiting' | 'active' | 'completed';
export type PlayerStatus = 'joined' | 'ready' | 'playing' | 'finished';
export type RoundStatus = 'pending' | 'active' | 'completed';
export type QuestionType = 'who' | 'when' | 'where' | 'with_whom' | 'what_did' | 'what_said' | 'how_ended';
export type StorySheetStatus = 'in_progress' | 'completed';
export interface GameSession {
    id: number;
    documentId: string;
    session_name: string | null;
    session_status: SessionStatus;
    max_players: number;
    current_players_count: number;
    template?: string;
    session_created_at: string | null;
    session_started_at: string | null;
    session_ended_at: string | null;
    players?: Player[];
    rounds?: Round[];
    story_sheets?: StorySheet[];
}
export interface Player {
    id: number;
    documentId: string;
    nickname: string;
    player_order: number | null;
    players_status: PlayerStatus;
    joined_at: string | null;
    session_id?: Pick<GameSession, 'id' | 'documentId'>;
}
export interface Round {
    id: number;
    documentId: string;
    round_number: number;
    question_type: QuestionType;
    rounds_status: RoundStatus;
    started_at: string | null;
    completed_at: string | null;
    session_id?: Pick<GameSession, 'id' | 'documentId'>;
    answers?: Answer[];
}
export interface Answer {
    id: number;
    documentId: string;
    answer_text: string;
    position_in_sheet: number;
    answers_created_at: string | null;
    player?: Pick<Player, 'id' | 'documentId' | 'nickname'>;
    round?: Pick<Round, 'id' | 'documentId'>;
    story_sheet?: Pick<StorySheet, 'id' | 'documentId'>;
}
export interface StorySheet {
    id: number;
    documentId: string;
    sheet_number: number | null;
    storysheets_status: StorySheetStatus;
    final_story: string | null;
    storysheets_created_at: string | null;
    storysheets_completed_at: string | null;
    game_session?: Pick<GameSession, 'id' | 'documentId'>;
    player?: Pick<Player, 'id' | 'documentId' | 'nickname'>;
    answers?: Answer[];
}
