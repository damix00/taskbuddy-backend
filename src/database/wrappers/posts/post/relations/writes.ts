import { executeQuery } from "../../../../connection";
import { PostWithRelations } from "../../../../models/posts/post";
import reads from "../queries/reads";
import writes from "../queries/writes";

export async function updatePostRelations(
    post: PostWithRelations
): Promise<PostWithRelations | null> {
    try {
        // Start a transaction
        await executeQuery("BEGIN");

        // Update interactions
        await executeQuery(
            `
            UPDATE post_interactions
            SET
                likes = $1,
                comments = $2,
                shares = $3,
                bookmarks = $4,
                impressions = $5
            WHERE id = $6
        `,
            [
                post.interactions.likes,
                post.interactions.comments,
                post.interactions.shares,
                post.interactions.bookmarks,
                post.interactions.impressions,
                post.interactions.id,
            ]
        );

        // Update removals
        await executeQuery(
            `
            UPDATE post_removals
            SET
                removed = $1,
                removal_reason = $2,
                flagged = $3,
                flagged_reason = $4,
                shadow_banned = $5
            WHERE id = $6
        `,
            [
                post.removals.removed,
                post.removals.removal_reason,
                post.removals.flagged,
                post.removals.flagged_reason,
                post.removals.shadow_banned,
                post.removals.id,
            ]
        );

        // Update location
        await executeQuery(
            `
            UPDATE post_locations
            SET
                lat = $1,
                lon = $2,
                location_name = $3,
                suggestion_radius = $4,
                remote = $5
            WHERE id = $6
        `,
            [
                post.location.lat,
                post.location.lon,
                post.location.location_name,
                post.location.suggestion_radius,
                post.location.remote,
                post.location.id,
            ]
        );

        // Update media

        // Delete all media
        await executeQuery(`DELETE FROM post_media WHERE post_id = $1`, [
            post.id,
        ]);

        const media = await Promise.all(
            post.media.map((media) =>
                executeQuery(
                    `INSERT INTO post_media (post_id, media, media_type) VALUES ($1, $2, $3)`,
                    [post.id, media.media, media.media_type]
                )
            )
        );

        if (!media || !media.length) throw new Error("Failed to update media");

        // Update tags

        // Delete all tags
        await executeQuery(`DELETE FROM post_tags WHERE post_id = $1`, [
            post.id,
        ]);

        const tags = await Promise.all(
            post.tags.map((tag) =>
                executeQuery(
                    `INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2)`,
                    [post.id, tag.tag_id]
                )
            )
        );

        if (!tags || !tags.length) throw new Error("Failed to update tags");

        // Update the post
        const result = await writes.updatePost(post);

        if (!result) throw new Error("Failed to update post");

        // Commit the transaction
        await executeQuery("COMMIT");

        return await reads.getPostById(post.id);
    } catch (err) {
        console.error(err);

        // Rollback the transaction
        await executeQuery("ROLLBACK");

        return null;
    }
}
