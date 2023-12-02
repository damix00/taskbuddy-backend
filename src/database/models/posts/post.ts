import { UserFields } from "../users/user";

export enum JobType {
    ONE_TIME = 0,
    PART_TIME = 1,
    FULL_TIME = 2,
}

export enum PostStatus {
    OPEN = 0,
    CLOSED = 1,
    RESERVED = 2,
    COMPLETED = 3,
    CANCELLED = 4,
    EXPIRED = 5,
}

export interface PostFields {
    id: number;
    uuid: string;
    user_id: number;
    title: string;
    title_vector: string;
    description: string;
    job_type: JobType;
    price: number;
    removals_id: number;
    post_location_id: number;
    interactions_id: number;
    start_date: Date;
    end_date: Date;
    status: PostStatus;
    reserved_by: number;
    created_at: Date;
    updated_at: Date;
}

export interface PostMedia {
    id: number;
    post_id: number;
    media_url: string;
    media_type: number;
}

export interface PostInteractions {
    id: number;
    likes: number;
    comments: number;
    shares: number;
    bookmarks: number;
    impressions: number;
}

export interface PostComments {
    id: number;
    post_id: number;
    user_id: number;
    comment: string;
    created_at: Date;
    is_reply: boolean;
    reply_to: number;
}

export interface PostRemovals {
    id: number;
    removed: boolean;
    removal_reason: string;
    flagged: boolean;
    flagged_reason: string;
    shadow_banned: boolean;
}

export interface PostLocation {
    id: number;
    remote: boolean;
    lat: number;
    lon: number;
    suggestion_radius: number;
    location_name: string;
}

export interface PostTags {
    post_id: number;
    tag_id: number;
}

export interface PostWithRelations extends PostFields {
    user: UserFields;
    media: PostMedia[];
    comments: PostComments[];
    interactions: PostInteractions;
    removals: PostRemovals;
    location: PostLocation;
    tags: PostTags[];
}

export interface PostWithRelationsModel extends PostWithRelations {
    update: (data: Partial<PostWithRelations>) => Promise<boolean>;
    deletePost: () => Promise<boolean>;
    refetch: () => Promise<void>;
    addMedia: (media: {
        media_url: string;
        media_type: string;
    }) => Promise<boolean>;
    removeMedia: (media: PostMedia) => Promise<boolean>;
    addComment: (comment: {
        user_id: number;
        comment: string;
        is_reply: boolean;
        reply_to: number;
    }) => Promise<boolean>;
    removeComment: (comment_id: number) => Promise<boolean>;
    addLike: (user_id: number) => Promise<boolean>;
    removeLike: (user_id: number) => Promise<boolean>;
    addBookmark: (user_id: number) => Promise<boolean>;
    removeBookmark: (user_id: number) => Promise<boolean>;
    addShare: (user_id: number) => Promise<boolean>;
    removeShare: (user_id: number) => Promise<boolean>;
    addTag: (tag_id: number) => Promise<boolean>;
    removeTag: (tag_id: number) => Promise<boolean>;
    addFlag: (flag: {
        removal_reason: string;
        flagged_reason: string;
    }) => Promise<boolean>;
    removeFlag: () => Promise<boolean>;
    shadowBan: () => Promise<boolean>;
    removeShadowBan: () => Promise<boolean>;
    reserve: (user_id: number) => Promise<boolean>;
    cancelReservation: () => Promise<boolean>;
    complete: () => Promise<boolean>;
    close: () => Promise<boolean>;
    reopen: () => Promise<boolean>;
    expire: () => Promise<boolean>;
    hasExpired: () => boolean;
}
