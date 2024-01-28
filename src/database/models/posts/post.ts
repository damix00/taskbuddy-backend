import { UserFields } from "../users/user";
import { PostComments } from "./comments";

// Enum for different types of jobs
export enum JobType {
    ONE_TIME = 0,
    PART_TIME = 1,
    FULL_TIME = 2,
}

// Enum for different statuses of a post
export enum PostStatus {
    OPEN = 0,
    CLOSED = 1,
    RESERVED = 2,
    COMPLETED = 3,
    CANCELLED = 4,
    EXPIRED = 5,
}

// Enum for different types of media
export enum MediaType {
    IMAGE = 0,
    VIDEO = 1,
}

// Interface for the fields in a post record
export interface PostFields {
    id: number;
    uuid: string;
    user_id: number;
    title: string;
    title_vector: string;
    classified_category: number;
    description: string;
    job_type: JobType;
    price: number;
    removals_id: number;
    post_location_id: number;
    interactions_id: number;
    start_date: Date;
    end_date: Date;
    urgent: boolean;
    status: PostStatus;
    reserved: boolean;
    created_at: Date;
    updated_at: Date;
}

// Interface for media related to a post
export interface PostMedia {
    id: number;
    post_id: number;
    media: string;
    type: number;
}

// Interface for interactions with a post
export interface PostInteractions {
    id: number;
    likes: number;
    comments: number;
    shares: number;
    bookmarks: number;
    impressions: number;
}

// Interface for removals of a post
export interface PostRemovals {
    id: number;
    removed: boolean;
    removal_reason: string;
    flagged: boolean;
    flagged_reason: string;
    shadow_banned: boolean;
}

// Interface for location of a post
export interface PostLocation {
    id: number;
    remote: boolean;
    lat: number;
    lon: number;
    approx_lat: number;
    approx_lon: number;
    suggestion_radius: number;
    location_name: string;
}

// Interface for tags of a post
export interface PostTags {
    post_id: number;
    tag_id: number;
}

// Interface for a post with all its relations
export interface PostWithRelations
    extends PostFields,
        PostInteractions,
        PostRemovals,
        PostLocation {
    media: PostMedia[];
    tags: PostTags[];
}

// Interface for a post model with all its relations and methods for manipulating the post
export interface PostWithRelationsModel extends PostWithRelations {
    update: (data: Partial<PostWithRelations>) => Promise<boolean>;
    deletePost: () => Promise<boolean>;
    refetch: () => Promise<void>;
    addMedia: (media: { media: string; type: MediaType }) => Promise<boolean>;
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
    addShare: () => Promise<boolean>;
    addTag: (tag_id: number) => Promise<boolean>;
    addImpression: () => Promise<boolean>;
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
