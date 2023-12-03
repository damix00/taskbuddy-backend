import { executeQuery } from "../../../../connection";
import {
    JobType,
    PostFields,
    PostInteractions,
    PostLocation,
    PostRemovals,
    PostStatus,
    PostWithRelations,
} from "../../../../models/posts/post";
import reads from "./reads";

namespace writes {
    // Creates a new post
    export async function createPost(data: {
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
            media_type: number;
        }[];
        location: {
            lat: number;
            lon: number;
            location_name: string;
            suggestion_radius: number;
            remote: boolean;
        };
        tags: number[]; // Tag IDs
        status?: PostStatus;
    }): Promise<PostFields | null> {
        try {
            // Start a transaction
            await executeQuery("BEGIN");

            // Create interactions row
            const interactions = await executeQuery<PostInteractions>(
                `INSERT INTO post_interactions DEFAULT VALUES RETURNING *`
            );

            if (!interactions || !interactions.length)
                throw new Error("Failed to create interactions");

            // Create removals row
            const removals = await executeQuery<PostRemovals>(
                `INSERT INTO post_removals DEFAULT VALUES RETURNING *`
            );

            if (!removals || !removals.length)
                throw new Error("Failed to create removals");

            // Create location row
            const location = await executeQuery<PostLocation>(
                `INSERT INTO post_location (
                    remote,
                    lat,
                    lon,
                    suggestion_radius,
                    location_name
                ) VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5
                ) RETURNING *
            `,
                [
                    data.location.remote,
                    data.location.lat,
                    data.location.lon,
                    data.location.suggestion_radius,
                    data.location.location_name,
                ]
            );

            if (!location || !location.length)
                throw new Error("Failed to create location");

            // Create post row
            const uuid = reads.generatePostUUID();

            if (!uuid) throw new Error("Failed to generate UUID");

            const post = await executeQuery<PostFields>(
                `
                INSERT INTO posts (
                    uuid,
                    user_id,
                    title,
                    title_vector,
                    description,
                    job_type,   
                    price,
                    removals_id,
                    post_location_id,
                    interactions_id,
                    start_date,
                    end_date,
                    status,
                    urgent
                ) VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7,
                    $8,
                    $9,
                    $10,
                    $11,
                    $12,
                    $13,
                    $14
                ) RETURNING *
            `,
                [
                    uuid,
                    data.user_id,
                    data.title,
                    data.title_vector,
                    data.description,
                    data.job_type,
                    data.price,
                    removals[0].id,
                    location[0].id,
                    interactions[0].id,
                    data.start_date,
                    data.end_date,
                    data.status || PostStatus.OPEN,
                    data.urgent,
                ]
            );

            if (!post || !post.length) throw new Error("Failed to create post");

            // Create post media rows
            const media = await Promise.all(
                data.media.map((media) =>
                    executeQuery(
                        `
                        INSERT INTO post_media (
                            post_id,
                            media,
                            media_type
                        ) VALUES (
                            $1,
                            $2,
                            $3
                        ) RETURNING *
                    `,
                        [post[0].id, media.media, media.media_type]
                    )
                )
            );

            if (!media || !media.length)
                throw new Error("Failed to create media");

            // Create post tags rows
            const tags = await Promise.all(
                data.tags.map((tag) =>
                    executeQuery(
                        `
                        INSERT INTO post_tags (
                            post_id,
                            tag_id
                        ) VALUES (
                            $1,
                            $2
                        ) RETURNING *
                    `,
                        [post[0].id, tag]
                    )
                )
            );

            if (!tags || !tags.length) throw new Error("Failed to create tags");

            // Commit the transaction
            await executeQuery("COMMIT");

            return post[0];
        } catch (e) {
            console.error(e);

            // Rollback the transaction
            await executeQuery("ROLLBACK");

            return null;
        }
    }

    // Updates a post
    export async function updatePost(
        data: PostFields
    ): Promise<PostFields | null> {
        try {
            const q = `
                UPDATE posts SET
                    title = $1,
                    title_vector = $2,
                    description = $3,
                    job_type = $4,
                    price = $5,
                    start_date = $6,
                    end_date = $7,
                    status = $8,
                    reserved_by = $9,
                    updated_at = NOW()
                WHERE id = $10
                RETURNING *
            `;

            const post = await executeQuery<PostFields>(q, [
                data.title,
                data.title_vector,
                data.description,
                data.job_type,
                data.price,
                data.start_date,
                data.end_date,
                data.status,
                data.reserved_by,
                data.id,
            ]);

            if (!post || !post.length) return null;

            return post[0];
        } catch (e) {
            console.error(e);

            return null;
        }
    }

    // Deletes a post
    export async function deletePost(post_id: number): Promise<boolean> {
        try {
            const q = `
                DELETE FROM posts
                WHERE id = $1
            `;

            await executeQuery(q, [post_id]);

            return true;
        } catch (e) {
            console.error(e);

            return false;
        }
    }
}

export default writes;
