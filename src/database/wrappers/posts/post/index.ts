import { DataModel } from "../../../data_model";
import {
    JobType,
    PostComments,
    PostInteractions,
    PostLocation,
    PostMedia,
    PostRemovals,
    PostStatus,
    PostTags,
    PostWithRelations,
    PostWithRelationsModel,
} from "../../../models/posts/post";
import { UserFields } from "../../../models/users/user";

class Post extends DataModel implements PostWithRelationsModel {
    user: UserFields;
    media: PostMedia[];
    comments: PostComments[];
    interactions: PostInteractions;
    removals: PostRemovals;
    location: PostLocation;
    tags: PostTags[];
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

    constructor(
        post: PostWithRelations | Post,
        refetchOnUpdate: boolean = true
    ) {
        super(refetchOnUpdate);

        Object.assign(this, post);
        this.refetchOnUpdate = refetchOnUpdate;
    }

    update: (data: Partial<PostWithRelations>) => Promise<boolean>;
    deletePost: () => Promise<boolean>;
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

export default Post;
