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
import {
    updatePostInteractions,
    updatePostRelations,
} from "./relations/writes";
import reads from "./queries/reads";
import writes from "./queries/writes";
import { PostComments } from "../../../models/posts/comments";
import FirebaseStorage from "../../../../firebase/storage/files";
import { UserReads } from "../../accounts/users/wrapper";
import { User } from "../../accounts/users";
import { Profile } from "../../accounts/profiles";
import { ProfileReads } from "../../accounts/profiles/wrapper";
import { Interactions } from "../interactions";

class Post extends DataModel implements PostWithRelationsModel {
    media: PostMedia[];
    tags: PostTags[];
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
    status: PostStatus;
    reserved: boolean;
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

    // User relations
    username: string;
    user_uuid: string;
    first_name: string;
    last_name: string;
    profile_picture: string;
    following: boolean = false;
    liked: boolean = false;
    bookmarked: boolean = false;
    has_premium: boolean = false;
    verified: boolean = false;

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

    public async updateInteractions(
        data: Partial<PostWithRelations>
    ): Promise<boolean> {
        this._refetch();

        const newPost = { ...this, ...data };

        const r = await updatePostInteractions(newPost);

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
        type: MediaType;
    }): Promise<boolean> {
        try {
            return this.update({
                media: [
                    ...this.media,
                    {
                        id: 0,
                        post_id: this.id,
                        media: media.media,
                        type: media.type,
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

    public async getUser(): Promise<User | null> {
        return await UserReads.getUserById(this.user_id);
    }

    public async getProfile(): Promise<Profile | null> {
        return await ProfileReads.getProfileByUid(this.user_id);
    }

    public async addLike(user_id: number, ip?: string): Promise<boolean> {
        try {
            if (await Interactions.isLiked(user_id, this.id)) {
                return false;
            }

            const result = await Interactions.likePost(user_id, this.id);

            if (!result) {
                return false;
            }

            this.updateInteractions({ likes: this.likes + 1 });

            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public async removeLike(user_id: number): Promise<boolean> {
        try {
            if (!(await Interactions.isLiked(user_id, this.id))) {
                return false;
            }

            const result = await Interactions.unlikePost(user_id, this.id);

            if (!result) {
                return false;
            }

            return await this.updateInteractions({ likes: this.likes - 1 });
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public async addBookmark(user_id: number): Promise<boolean> {
        try {
            if (await Interactions.isBookmarked(user_id, this.id)) {
                return false;
            }

            const result = await Interactions.bookmarkPost(user_id, this.id);

            if (!result) {
                return false;
            }

            return await this.updateInteractions({
                bookmarks: this.bookmarks + 1,
            });
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public async removeBookmark(user_id: number): Promise<boolean> {
        try {
            if (!(await Interactions.isBookmarked(user_id, this.id))) {
                return false;
            }

            const result = await Interactions.unbookmarkPost(user_id, this.id);

            if (!result) {
                return false;
            }

            this.updateInteractions({ bookmarks: this.bookmarks - 1 });

            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public async addShare(): Promise<boolean> {
        try {
            return await this.updateInteractions({ shares: this.shares + 1 });
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public async addImpression(): Promise<boolean> {
        try {
            return await this.updateInteractions({
                impressions: this.impressions + 1,
            });
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public async reserve(): Promise<boolean> {
        return await this.update({
            reserved: true,
        });
    }

    public async complete(): Promise<boolean> {
        return await this.update({
            status: PostStatus.COMPLETED,
        });
    }

    public async addFlag(flag: {
        removal_reason: string;
        flagged_reason: string;
    }): Promise<boolean> {
        try {
            return await this.update({
                removal_reason: flag.removal_reason,
                flagged_reason: flag.flagged_reason,
                flagged: true,
            });
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public async removeFlag(): Promise<boolean> {
        try {
            return await this.update({
                removal_reason: "",
                flagged_reason: "",
                flagged: false,
            });
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public async shadowBan(): Promise<boolean> {
        try {
            return await this.update({
                shadow_banned: true,
            });
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public async removeShadowBan(): Promise<boolean> {
        try {
            return await this.update({
                shadow_banned: false,
            });
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public async cancelReservation(): Promise<boolean> {
        try {
            return await this.update({
                reserved: false,
            });
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public async close(): Promise<boolean> {
        try {
            return await this.update({
                status: PostStatus.CLOSED,
            });
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public async reopen(): Promise<boolean> {
        try {
            return await this.update({
                status: PostStatus.OPEN,
            });
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public async expire(): Promise<boolean> {
        try {
            return await this.update({
                status: PostStatus.EXPIRED,
            });
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public hasExpired(): boolean {
        return this.status == PostStatus.EXPIRED;
    }

    addComment: (comment: {
        user_id: number;
        comment: string;
        is_reply: boolean;
        reply_to: number;
    }) => Promise<boolean>;
    removeComment: (comment_id: number) => Promise<boolean>;
    addTag: (tag_id: number) => Promise<boolean>;
    removeTag: (tag_id: number) => Promise<boolean>;
}

export default Post;
