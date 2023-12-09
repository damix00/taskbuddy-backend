import { DataModel } from "../../../data_model";
import {
    JobType,
    MediaType,
    PostInteractions,
    PostLocation,
    PostMedia,
    PostRemovals,
    PostStatus,
    PostTags,
    PostWithRelations,
    PostWithRelationsModel,
} from "../../../models/posts/post";
import { updatePostRelations } from "./relations/writes";
import reads from "./queries/reads";
import writes from "./queries/writes";
import { PostComments } from "../../../models/posts/comments";
import FirebaseStorage from "../../../../firebase/storage/files";

class Post extends DataModel implements PostWithRelationsModel {
    media: PostMedia[];
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
    likes: number;
    comments: number;
    shares: number;
    bookmarks: number;
    impressions: number;
    removed: boolean;
    removal_reason: string;
    flagged: boolean;
    flagged_reason: string;
    shadow_banned: boolean;
    remote: boolean;
    lat: number;
    lon: number;
    approx_lat: number;
    approx_lon: number;
    suggestion_radius: number;
    location_name: string;
    urgent: boolean;

    constructor(
        post: PostWithRelations | Post,
        refetchOnUpdate: boolean = true
    ) {
        super(refetchOnUpdate);

        post.likes = parseInt(post.likes.toString());
        post.comments = parseInt(post.comments.toString());
        post.shares = parseInt(post.shares.toString());
        post.bookmarks = parseInt(post.bookmarks.toString());
        post.impressions = parseInt(post.impressions.toString());
        post.id = parseInt(post.id.toString());
        post.user_id = parseInt(post.user_id.toString());
        post.price = parseFloat(post.price.toString());
        post.removals_id = parseInt(post.removals_id.toString());
        post.post_location_id = parseInt(post.post_location_id.toString());
        post.interactions_id = parseInt(post.interactions_id.toString());
        post.reserved_by = parseInt(post.reserved_by.toString());

        Object.assign(this, post);
        this.refetchOnUpdate = refetchOnUpdate;
    }

    public override async refetch(): Promise<void> {
        const result = await reads.getPostById(this.id);

        if (!result) throw new Error("Post not found");

        super.setData(result);
    }

    public async update(data: Partial<PostWithRelations>): Promise<boolean> {
        this._refetch();

        const newPost = { ...this, ...data };

        const r = await updatePostRelations(newPost);

        if (r) {
            super.setData(newPost);
            return true;
        }

        return false;
    }

    public async deletePost(): Promise<boolean> {
        return await writes.deletePost(this.id);
    }

    public async addMedia(media: {
        media: string;
        media_type: MediaType;
    }): Promise<boolean> {
        try {
            return this.update({
                media: [
                    ...this.media,
                    {
                        id: 0,
                        post_id: this.id,
                        media: media.media,
                        media_type: media.media_type,
                    },
                ],
            });
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public async removeMedia(media: PostMedia): Promise<boolean> {
        try {
            await FirebaseStorage.deleteFile(media.media); // Delete the file from storage
            return this.update({
                media: this.media.filter((m) => m.id !== media.id), // Remove the media from the post
            });
        } catch (e) {
            console.error(e);
            return false;
        }
    }

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
