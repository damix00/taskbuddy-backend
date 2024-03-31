export enum UrgencyType {
    ALL = 0,
    NOT_URGENT = 1,
    URGENT = 2,
}

export enum LocationType {
    ALL = 0,
    REMOTE = 1,
    LOCAL = 2,
}

export enum SessionType {
    ALL = 0,
    FOLLOWING = 1,
}

export interface SessionFilters {
    urgency: UrgencyType; // 0 = all, 1 = not urgent, 2 = urgent
    location: LocationType; // 0 = all, 1 = remote, 2 = local
    tags: number[]; // tag ids
    type: SessionType; // 0 = all, 1 = following
    min_price?: number;
    max_price?: number;
}

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
