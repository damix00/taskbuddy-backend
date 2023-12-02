// Interface for comments on a post
export interface PostComments {
    id: number;
    post_id: number;
    user_id: number;
    comment: string;
    created_at: Date;
    likes: number;
    reply_count: number;
    is_reply: boolean;
    reply_to: number;
}

// Model interface for comments
export interface PostCommentsModel extends PostComments {
    deleteComment: () => Promise<boolean>;
    addLike: (user_id: number) => Promise<boolean>;
    removeLike: (user_id: number) => Promise<boolean>;
    addReply: (reply: {
        user_id: number;
        comment: string;
        reply_to: number;
    }) => Promise<boolean>;
    removeReply: (reply_id: number) => Promise<boolean>;
}
