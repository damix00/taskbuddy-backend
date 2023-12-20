import { v4 } from "uuid";
import { executeQuery } from "../../../../connection";
import { PostWithRelations } from "../../../../models/posts/post";

async function getPostByField(
    field: string,
    value: string,
    user_id: number | null = null
): Promise<PostWithRelations | null> {
    try {
        const q = `
            SELECT
                posts.*,
                post_interactions.likes,
                post_interactions.comments,
                post_interactions.shares,
                post_interactions.bookmarks,
                post_interactions.impressions,
                post_removals.removed,
                post_removals.removal_reason,
                post_removals.flagged,
                post_removals.flagged_reason,
                post_removals.shadow_banned,
                post_location.remote,
                post_location.lat,
                post_location.lon,
                post_location.approx_lat,
                post_location.approx_lon,
                post_location.suggestion_radius,
                post_location.location_name,
                users.username,
                users.first_name,
                users.last_name,
                profiles.profile_picture,
                ${
                    // Select if the user is following the author, if it's liked and bookmarked
                    user_id
                        ? `
                EXISTS(SELECT 1 FROM follows WHERE follows.follower = $2 AND follows.following = posts.user_id) AS following,
                EXISTS(SELECT 1 FROM post_interaction_logs WHERE post_interaction_logs.user_id = $2 AND post_interaction_logs.post_id = posts.id AND interaction_type = 0) AS liked,
                EXISTS(SELECT 1 FROM post_interaction_logs WHERE post_interaction_logs.user_id = $2 AND post_interaction_logs.post_id = posts.id AND interaction_type = 3) AS bookmarked,
                `
                        : ""
                }
                COALESCE(json_agg(DISTINCT post_media) FILTER (WHERE post_media.id IS NOT NULL), '[]') AS media,
                COALESCE(json_agg(DISTINCT post_tag_relationship) FILTER (WHERE post_tag_relationship.post_id IS NOT NULL), '[]') AS tags
            FROM 
                posts
            INNER JOIN post_media ON posts.id = post_media.post_id
            INNER JOIN post_tag_relationship ON posts.id = post_tag_relationship.post_id
            INNER JOIN users ON posts.user_id = users.id
            INNER JOIN profiles ON posts.user_id = profiles.user_id
            LEFT JOIN post_location ON posts.post_location_id = post_location.id
            LEFT JOIN post_interactions ON posts.interactions_id = post_interactions.id
            LEFT JOIN post_removals ON posts.removals_id = post_removals.id
            WHERE ${field} = $1 AND post_removals.removed = false
            ${
                // Check if the user is blocked by the author
                user_id
                    ? `
                AND NOT EXISTS(SELECT 1 FROM blocks WHERE blocks.blocker = posts.user_id AND blocks.blocked = $2)
                `
                    : ""
            }
            GROUP BY posts.id, post_interactions.id, post_removals.id, post_location.id, users.id, profiles.id
        `;

        const args = [value];

        if (user_id) args.push(user_id as any);

        const r = await executeQuery<PostWithRelations>(q, args);

        return r.length > 0 ? r[0] : null;
    } catch (e) {
        console.error(e);

        return null;
    }
}

namespace reads {
    export async function getPostById(
        id: number,
        user_id: number | null = null
    ): Promise<PostWithRelations | null> {
        return await getPostByField("posts.id", id.toString(), user_id);
    }

    export async function getPostByUUID(
        uuid: string,
        user_id: number | null = null
    ): Promise<PostWithRelations | null> {
        return await getPostByField("posts.uuid", uuid, user_id);
    }

    export async function generatePostUUID(): Promise<String | null> {
        try {
            do {
                const uuid = v4();

                const q = `
                    SELECT uuid FROM posts WHERE uuid = $1
                `;

                const r = await executeQuery<{ uuid: string }>(q, [uuid]);

                if (r.length === 0) return uuid;
            } while (true);
        } catch (e) {
            console.error(e);

            return null;
        }
    }

    export async function getPostsByUser(
        user_id: number,
        offset: number
    ): Promise<PostWithRelations[] | null> {
        try {
            const q = `
                SELECT
                    posts.*,
                    post_interactions.*,
                    post_removals.*,
                    post_location.*,
                    users.username,
                    users.first_name,
                    users.last_name,
                    profiles.profile_picture,
                    EXISTS(SELECT 1 FROM follows WHERE follows.follower = $2 AND follows.following = posts.user_id) AS following,
                    EXISTS(SELECT 1 FROM post_interaction_logs WHERE post_interaction_logs.user_id = $2 AND post_interaction_logs.post_id = posts.id AND interaction_type = 0) AS liked,
                    EXISTS(SELECT 1 FROM post_interaction_logs WHERE post_interaction_logs.user_id = $2 AND post_interaction_logs.post_id = posts.id AND interaction_type = 3) AS bookmarked,
                    COALESCE(json_agg(DISTINCT post_media) FILTER (WHERE post_media.id IS NOT NULL), '[]') AS media,
                    COALESCE(json_agg(DISTINCT post_tag_relationship) FILTER (WHERE post_tag_relationship.post_id IS NOT NULL), '[]') AS tags
                FROM 
                    posts
                INNER JOIN post_media ON posts.id = post_media.post_id
                INNER JOIN post_tag_relationship ON posts.id = post_tag_relationship.post_id
                INNER JOIN users ON posts.user_id = users.id
                INNER JOIN profiles ON posts.user_id = profiles.user_id
                LEFT JOIN post_location ON posts.post_location_id = post_location.id
                LEFT JOIN post_interactions ON posts.interactions_id = post_interactions.id
                LEFT JOIN post_removals ON posts.removals_id = post_removals.id
                WHERE posts.user_id = $1 AND post_removals.removed = false
                ${
                    // Check if the user is blocked by the author
                    user_id
                        ? `
                    AND NOT EXISTS(SELECT 1 FROM blocks WHERE blocks.blocker = posts.user_id AND blocks.blocked = $2)
                    `
                        : ""
                }
                GROUP BY posts.id, post_interactions.id, post_removals.id, post_location.id, users.id, profiles.id
                ORDER BY posts.created_at DESC
                LIMIT 10 OFFSET $2
            `;

            const r = await executeQuery<PostWithRelations>(q, [
                user_id,
                offset,
            ]);

            return r;
        } catch (e) {
            console.error(e);

            return null;
        }
    }
}

export default reads;
