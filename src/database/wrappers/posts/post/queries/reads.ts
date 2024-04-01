import { v4 } from "uuid";
import { executeQuery } from "../../../../connection";
import { PostWithRelations } from "../../../../models/posts/post";
import RemoteConfigData from "../../../../../firebase/remote_config";
import {
    LocationType,
    UrgencyType,
} from "../../../../models/algorithm/scroll_sessions";

const postFields = `posts.*,
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
users.uuid AS user_uuid,
users.has_premium AS has_premium,
users.verified AS verified,
users.username,
users.first_name,
users.last_name,
profiles.profile_picture`;

async function getPostByField(
    field: string,
    value: string,
    user_id: number | null = null
): Promise<PostWithRelations | null> {
    try {
        const q = `
            SELECT
                ${postFields},
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
        offset: number,
        requester_user_id: number | null = null
    ): Promise<PostWithRelations[] | null> {
        try {
            const q = `
                SELECT
                    ${postFields},
                    ${
                        // Select if the user is following the author, if it's liked and bookmarked
                        requester_user_id
                            ? `
                    EXISTS(SELECT 1 FROM follows WHERE follows.follower = $3 AND follows.following = posts.user_id) AS following,
                    EXISTS(SELECT 1 FROM post_interaction_logs WHERE post_interaction_logs.user_id = $3 AND post_interaction_logs.post_id = posts.id AND interaction_type = 0) AS liked,
                    EXISTS(SELECT 1 FROM post_interaction_logs WHERE post_interaction_logs.user_id = $3 AND post_interaction_logs.post_id = posts.id AND interaction_type = 3) AS bookmarked,
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
                WHERE posts.user_id = $1 AND post_removals.removed = false
                ${
                    // Check if the user is blocked by the author
                    requester_user_id
                        ? `
                    AND (NOT EXISTS(SELECT 1 FROM blocks WHERE blocks.blocker = posts.user_id AND blocks.blocked = $3) OR NOT EXISTS(SELECT 1 FROM blocks WHERE blocks.blocker = $3 AND blocks.blocked = posts.user_id))
                    `
                        : ""
                }
                GROUP BY posts.id, post_interactions.id, post_removals.id, post_location.id, users.id, profiles.id
                ORDER BY posts.created_at DESC
                LIMIT 10 OFFSET $2
            `;

            const p = [user_id, offset];

            if (requester_user_id) p.push(requester_user_id);

            const r = await executeQuery<PostWithRelations>(q, p);

            return r;
        } catch (e) {
            console.error(e);

            return null;
        }
    }

    /**
     * Search for posts
     * @param user_id User ID of the user searching
     * @param query_vector Query vector
     * @param offset Offset
     */
    export async function searchPosts(
        user_id: number,
        query_vector: any,
        offset: number,
        filters: {
            filteredTags?: number[];
            urgency?: number;
            location?: number;
            minPrice?: number;
            maxPrice?: number;
        }
    ): Promise<PostWithRelations[] | null> {
        try {
            const threshold = RemoteConfigData.searchThreshold;

            const q = `
            SELECT
                ${postFields},
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
            WHERE post_removals.shadow_banned = false AND post_removals.removed = false AND posts.user_id != $2
            ${
                (filters.filteredTags?.length ?? 0) > 0
                    ? `AND (${filters
                          .filteredTags!.map(
                              (id, i) => ` post_tag_relationship.tag_id = ${id}`
                          )
                          .join(" OR ")})`
                    : ""
            }
            ${
                filters.urgency != UrgencyType.ALL
                    ? filters.urgency == UrgencyType.URGENT
                        ? " AND posts.urgent = true"
                        : " AND posts.urgent = false"
                    : ""
            }
            ${
                filters.location != LocationType.ALL
                    ? filters.location == LocationType.REMOTE
                        ? " AND post_location.remote = true"
                        : " AND post_location.remote = false"
                    : ""
            }
            ${filters.minPrice ? ` AND posts.price >= ${filters.minPrice}` : ""}
            ${filters.maxPrice ? ` AND posts.price <= ${filters.maxPrice}` : ""}
            AND NOT EXISTS(SELECT 1 FROM blocks WHERE blocks.blocker = posts.user_id AND blocks.blocked = $2) AND NOT EXISTS(SELECT 1 FROM blocks WHERE blocks.blocker = $2 AND blocks.blocked = posts.user_id)
            AND title_vector <=> $1 > $3
            GROUP BY posts.id, post_interactions.id, post_removals.id, post_location.id, users.id, profiles.id
            ORDER BY title_vector <=> $1
            LIMIT 10 OFFSET $4
            `;

            const r = await executeQuery<PostWithRelations>(q, [
                `[${query_vector}]`,
                user_id,
                threshold,
                offset,
            ]);

            return r;
        } catch (e) {
            console.error(e);

            return null;
        }
    }

    /**
     * Get nearby posts
     * @param user_id User ID of the user searching
     * @param lat Latitude
     * @param lon Longitude
     * @param offset Offset
     */
    export async function getNearbyPosts(
        user_id: number,
        lat: number,
        lon: number,
        offset: number
    ): Promise<PostWithRelations[] | null> {
        try {
            const q = `
            SELECT
                ${postFields},
                ST_DistanceSphere(ST_MakePoint($3, $2), ST_MakePoint(post_location.lon, post_location.lat)),
                EXISTS(SELECT 1 FROM follows WHERE follows.follower = $1 AND follows.following = posts.user_id) AS following,
                EXISTS(SELECT 1 FROM post_interaction_logs WHERE post_interaction_logs.user_id = $1 AND post_interaction_logs.post_id = posts.id AND interaction_type = 0) AS liked,
                EXISTS(SELECT 1 FROM post_interaction_logs WHERE post_interaction_logs.user_id = $1 AND post_interaction_logs.post_id = posts.id AND interaction_type = 3) AS bookmarked,
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
            WHERE post_location.remote = false AND post_removals.removed = false AND post_removals.shadow_banned = false AND posts.user_id != $1
            AND posts.reserved = false
            AND posts.end_date > NOW()
            -- Post is within the posts suggestion radius or the user is following the author, postgis distance is in meters so divide by 1000 to get kilometers
            AND (ST_DistanceSphere(ST_MakePoint($3, $2), ST_MakePoint(post_location.lon, post_location.lat)) / 1000) <= post_location.suggestion_radius
            AND NOT EXISTS(SELECT 1 FROM blocks WHERE blocks.blocker = posts.user_id AND blocks.blocked = $1) AND NOT EXISTS(SELECT 1 FROM blocks WHERE blocks.blocker = $1 AND blocks.blocked = posts.user_id)
            GROUP BY posts.id, post_interactions.id, post_removals.id, post_location.id, users.id, profiles.id
            ORDER BY ST_DistanceSphere(ST_MakePoint($3, $2), ST_MakePoint(post_location.lon, post_location.lat)) ASC
            LIMIT 10 OFFSET $4
            `;

            const r = await executeQuery<PostWithRelations>(q, [
                user_id,
                lat,
                lon,
                offset,
            ]);

            return r;
        } catch (e) {
            console.error(e);

            return null;
        }
    }

    export async function getUserBookmarks(
        user_id: number,
        offset: number
    ): Promise<PostWithRelations[] | null> {
        try {
            const q = `
                SELECT
                    ${postFields},
                    EXISTS(SELECT 1 FROM follows WHERE follows.follower = $2 AND follows.following = posts.user_id) AS following,
                    EXISTS(SELECT 1 FROM post_interaction_logs WHERE post_interaction_logs.user_id = $1 AND post_interaction_logs.post_id = posts.id AND interaction_type = 0) AS liked,
                    EXISTS(SELECT 1 FROM post_interaction_logs WHERE post_interaction_logs.user_id = $1 AND post_interaction_logs.post_id = posts.id AND interaction_type = 3) AS bookmarked,
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
                WHERE posts.id IN (SELECT post_id FROM post_interaction_logs WHERE user_id = $1 AND interaction_type = 3) AND post_removals.removed = false
                GROUP BY posts.id, post_interactions.id, post_removals.id, post_location.id, users.id, profiles.id
                -- Order by when the post was bookmarked
                ORDER BY (SELECT created_at FROM post_interaction_logs WHERE post_interaction_logs.user_id = $1 AND post_interaction_logs.post_id = posts.id AND interaction_type = 3) DESC
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
