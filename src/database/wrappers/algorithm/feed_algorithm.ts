import { executeQuery } from "../../connection";
import {
    LocationType,
    SessionFilters,
    UrgencyType,
} from "../../models/algorithm/scroll_sessions";
import { PostWithRelations } from "../../models/posts/post";
import Post from "../posts/post";

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

export class FeedAlgorithm {
    filters: SessionFilters;
    session_id: number;
    user_id: number;
    lat: number;
    lon: number;
    loaded_post_ids: number[];

    constructor(
        filters: SessionFilters,
        session_id: number,
        user_id: number,
        lat: number,
        lon: number,
        loaded_post_ids: number[] = []
    ) {
        this.filters = filters;
        this.session_id = session_id;
        this.user_id = user_id;
        this.lat = lat;
        this.lon = lon;
        this.loaded_post_ids = loaded_post_ids;
    }

    async getFollowingPosts(limit: number = 10): Promise<Post[]> {
        // Get all posts from users that the user follows that match the filters
        try {
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
            -- Don't include posts that the user has already seen, escape the post ids
            WHERE ${
                this.loaded_post_ids.length > 0
                    ? `posts.id NOT IN (${this.loaded_post_ids.join(", ")})`
                    : "true"
            }
                -- Urgency filter
                ${
                    this.filters.urgency != UrgencyType.ALL
                        ? this.filters.urgency == UrgencyType.URGENT
                            ? "AND posts.urgent = true"
                            : "AND posts.urgent = false"
                        : ""
                }
                -- Location filter
                ${
                    this.filters.location != LocationType.ALL
                        ? this.filters.location == LocationType.REMOTE
                            ? "AND post_location.remote = true"
                            : "AND post_location.remote = false"
                        : ""
                }
                -- Tag filter
                ${
                    this.filters.tags.length > 0
                        ? `AND post_tag_relationship.tag_id IN (${this.filters.tags.join(
                              ", "
                          )})`
                        : ""
                }
                AND posts.user_id != $1 AND post_removals.removed = false
                AND EXISTS(SELECT 1 FROM follows WHERE follows.follower = $2 AND follows.following = posts.user_id)
                AND (NOT EXISTS(SELECT 1 FROM blocks WHERE blocks.blocker = posts.user_id AND blocks.blocked = $2) OR NOT EXISTS(SELECT 1 FROM blocks WHERE blocks.blocker = $2 AND blocks.blocked = posts.user_id))
            GROUP BY posts.id, post_interactions.id, post_removals.id, post_location.id, users.id, profiles.id
            -- Order by most recent
            ORDER BY posts.created_at DESC
            LIMIT $3
            `;

            const result = await executeQuery<PostWithRelations>(q, [
                this.user_id,
                this.user_id,
                limit,
            ]);

            if (result.length === 0) {
                return [];
            }

            const r = result.map((p) => new Post(p));

            return r;
        } catch (err) {
            console.error(err);
            return [];
        }
    }
}
