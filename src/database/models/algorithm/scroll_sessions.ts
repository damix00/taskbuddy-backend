export interface ScrollSessionFields {
    id: number;
    user_id: number;
    ip_address: string;
    lat?: number;
    lon?: number;
    filters: string; // JSON
    created_at: Date;
    updated_at: Date;
}

export interface SessionPostFields {
    id: number;
    scroll_session_id: number;
    post_id: number;
    created_at: Date;
    updated_at: Date;
}
