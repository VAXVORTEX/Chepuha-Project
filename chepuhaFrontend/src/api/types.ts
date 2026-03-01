export type SessionStatus = 'waiting' | 'active' | 'completed';
export type PlayerStatus = 'joined' | 'ready' | 'playing' | 'finished';
export type RoundStatus = 'pending' | 'active' | 'completed';
export type QuestionType = 'who' | 'when' | 'where' | 'with_whom' | 'what_did' | 'what_said' | 'how_ended';
export type StorySheetStatus = 'in_progress' | 'completed';

export interface GameSession {
    id: number;
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
    nickname: string;
    player_order: number | null;
    players_status: PlayerStatus;
    joined_at: string | null;
    session_id?: number | GameSession;
}

export interface Round {
    id: number;
    round_number: number;
    question_type: QuestionType;
    rounds_status: RoundStatus;
    started_at: string | null;
    completed_at: string | null;
    session_id?: number | GameSession;
    answers?: Answer[];
}

export interface Answer {
    id: number;
    answer_text: string;
    position_in_sheet: number;
    answers_created_at: string | null;
    player_id?: number | Player;
    round_id?: number | Round;
    story_sheet_id?: number | StorySheet;
}

export interface StorySheet {
    id: number;
    sheet_number: number | null;
    storysheets_status: StorySheetStatus;
    final_story: string | null;
    storysheets_created_at: string | null;
    storysheets_completed_at: string | null;
    game_session_id?: number | GameSession;
    player_id?: number | Player;
    answers?: Answer[];
}
