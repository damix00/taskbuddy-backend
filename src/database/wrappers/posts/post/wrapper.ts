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

    // @ts-ignore
    if (post?.media) return new Post(post as PostWithRelations);

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
    public static async getPostById(id: number): Promise<Post | null> {
        return await toPost(await reads.getPostById(id));
    }

    public static async getPostByUUUID(uuid: string): Promise<Post | null> {
        return await toPost(await reads.getPostByUUID(uuid));
    }
}

export class PostWrites {
    public static async createPost(data: {
        user_id: number;
        title: string;
        title_vector: any;
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
}
