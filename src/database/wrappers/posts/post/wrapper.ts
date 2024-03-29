import Post from ".";
import {
    JobType,
    PostFields,
    PostStatus,
    PostWithRelations,
} from "../../../models/posts/post";
import { updatePostRelations } from "./relations/writes";
import reads from "./queries/reads";
import writes from "./queries/writes";

async function toPost(
    post: PostFields | PostWithRelations | Post | null
): Promise<Post | null> {
    if (!post) return null;

    if (post instanceof Post) return post;

    post.id = parseInt(post.id as unknown as string);
    post.user_id = parseInt(post.user_id as unknown as string);

    // @ts-ignore
    post?.likes = parseInt(post?.likes as unknown as string);
    // @ts-ignore
    post?.comments = parseInt(post?.comments as unknown as string);
    // @ts-ignore
    post?.bookmarks = parseInt(post?.bookmarks as unknown as string);

    // @ts-ignore
    if (post?.username) return new Post(post as PostWithRelations);

    const find = await reads.getPostById(post!.id);

    if (!find) return null;

    // Cast to int
    find.user_id = parseInt(find.user_id as unknown as string);
    find.id = parseInt(find.id as unknown as string);
    find.removals_id = parseInt(find.removals_id as unknown as string);
    find.interactions_id = parseInt(find.interactions_id as unknown as string);
    find.post_location_id = parseInt(
        find.post_location_id as unknown as string
    );

    return new Post(find);
}

export class PostReads {
    public static async getPostById(
        id: number,
        user_id: number | null = null
    ): Promise<Post | null> {
        return await toPost(await reads.getPostById(id, user_id));
    }

    public static async getPostByUUID(
        uuid: string,
        user_id: number | null = null
    ): Promise<Post | null> {
        return await toPost(await reads.getPostByUUID(uuid, user_id));
    }

    public static async getPostsByUser(
        user_id: number,
        offset: number,
        requester_user_id: number | null = null
    ): Promise<Post[] | null> {
        const posts = await reads.getPostsByUser(
            user_id,
            offset,
            requester_user_id
        );

        if (!posts) return null;

        let res = [];

        for (const post of posts) {
            res.push((await toPost(post)) as Post);
        }

        return res;
    }

    public static async searchPosts(
        user_id: number,
        query_vector: any,
        offset: number,
        filters: {
            filteredTags?: number[];
            urgency?: number;
            location?: number;
        }
    ) {
        const posts = await reads.searchPosts(
            user_id,
            query_vector,
            offset,
            filters
        );

        if (!posts) return null;

        let res = [];

        for (const post of posts) {
            res.push((await toPost(post)) as Post);
        }

        return res;
    }

    public static async getNearbyPosts(
        user_id: number,
        lat: number,
        lon: number,
        offset: number
    ): Promise<Post[] | null> {
        const posts = await reads.getNearbyPosts(user_id, lat, lon, offset);

        if (!posts) return null;

        let res = [];

        for (const post of posts) {
            res.push((await toPost(post)) as Post);
        }

        return res;
    }

    public static async getUserBookmarks(
        user_id: number,
        offset: number
    ): Promise<Post[] | null> {
        const posts = await reads.getUserBookmarks(user_id, offset);

        if (!posts) return null;

        let res = [];

        for (const post of posts) {
            res.push((await toPost(post)) as Post);
        }

        return res;
    }
}

export class PostWrites {
    public static async createPost(data: {
        user_id: number;
        title: string;
        title_vector: any;
        classified_category: number;
        description: string;
        job_type: JobType;
        price: number;
        start_date: Date;
        end_date: Date;
        urgent: boolean;
        media: {
            media: string;
            media_type: string;
        }[];
        location: {
            lat?: number | null;
            lon?: number | null;
            location_name?: string | null;
            suggestion_radius: number;
            remote: boolean;
            approx_lat?: number | null;
            approx_lon?: number | null;
        };
        tags: number[]; // Tag IDs
        status?: PostStatus;
    }): Promise<Post | null> {
        return await toPost(await writes.createPost(data));
    }

    public static async updatePost(data: PostFields): Promise<Post | null> {
        return await toPost(await writes.updatePost(data));
    }

    public static async updateRelations(
        data: PostWithRelations
    ): Promise<Post | null> {
        return await toPost(await updatePostRelations(data));
    }

    public static async deletePost(post_id: number): Promise<boolean> {
        return writes.deletePost(post_id);
    }

    public static async deletePostsByUser(user_id: number): Promise<boolean> {
        return writes.deletePostsByUser(user_id);
    }
}
