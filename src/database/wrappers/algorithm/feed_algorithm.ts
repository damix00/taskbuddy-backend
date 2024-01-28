import { executeQuery } from "../../connection";
import {
    LocationType,
    SessionFilters,
    UrgencyType,
} from "../../models/algorithm/scroll_sessions";
import { PostWithRelations } from "../../models/posts/post";
import Post from "../posts/post";
import { UserInterests } from "./user_interests_wrapper";

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

    private async getPosts(
        limit: number = 10,
        condition: string = "",
        following: boolean = false
    ): Promise<Post[]> {
        // Get all posts that match the filters and that matches the condition
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
                users.uuid AS user_uuid,
                users.has_premium AS has_premium,
                users.verified AS verified,
                users.username,
                users.first_name,
                users.last_name,
                profiles.profile_picture,
                EXISTS(SELECT 1 FROM follows WHERE follows.follower = ${
                    this.user_id
                } AND follows.following = posts.user_id) AS following,
                EXISTS(SELECT 1 FROM post_interaction_logs WHERE post_interaction_logs.user_id = ${
                    this.user_id
                } AND post_interaction_logs.post_id = posts.id AND interaction_type = 0) AS liked,
                EXISTS(SELECT 1 FROM post_interaction_logs WHERE post_interaction_logs.user_id = ${
                    this.user_id
                } AND post_interaction_logs.post_id = posts.id AND interaction_type = 3) AS bookmarked,
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
            WHERE ${
                this.loaded_post_ids.length > 0
                    ? ` posts.id NOT IN (${this.loaded_post_ids.join(", ")})`
                    : " true"
            }
                ${
                    this.filters.urgency != UrgencyType.ALL
                        ? this.filters.urgency == UrgencyType.URGENT
                            ? " AND posts.urgent = true"
                            : " AND posts.urgent = false"
                        : ""
                }
                ${
                    this.filters.location != LocationType.ALL
                        ? this.filters.location == LocationType.REMOTE
                            ? " AND post_location.remote = true"
                            : " AND post_location.remote = false"
                        : ""
                }
                ${
                    this.filters.tags.length > 0
                        ? ` AND post_tag_relationship.tag_id IN (${this.filters.tags.join(
                              ", "
                          )})`
                        : ""
                }
                ${condition}
                 AND posts.user_id != ${
                     this.user_id
                 } AND post_removals.removed = false
                ${
                    following
                        ? ` AND EXISTS(SELECT 1 FROM follows WHERE follows.follower = ${this.user_id} AND follows.following = posts.user_id)`
                        : ""
                }
                AND posts.end_date > NOW()
                AND (NOT EXISTS(SELECT 1 FROM blocks WHERE blocks.blocker = posts.user_id AND blocks.blocked = ${
                    this.user_id
                }) OR NOT EXISTS(SELECT 1 FROM blocks WHERE blocks.blocker = ${
                this.user_id
            } AND blocks.blocked = posts.user_id))
            GROUP BY posts.id, post_interactions.id, post_removals.id, post_location.id, users.id, profiles.id
            ORDER BY posts.created_at DESC
            LIMIT ${limit}
            `;

            const result = await executeQuery<PostWithRelations>(
                // @ts-ignore
                q.replaceAll("\n", " "),
                []
            );

            const r = result.map((p) => new Post(p));

            return r;
        } catch (err) {
            console.log("ERROR");

            console.error(err);
            return [];
        }
    }

    async getFollowingPosts(limit: number = 10): Promise<Post[]> {
        return await this.getPosts(limit, "", true);
    }

    async getPostsByCategory(
        category_id: number,
        limit: number = 10
    ): Promise<Post[]> {
        return await this.getPosts(
            limit,
            `AND posts.classified_category = ${category_id}`,
            true
        );
    }

    async getSuggestedPosts(limit: number = 20): Promise<Post[]> {
        try {
            const tmpPosts = [];

            // Select a random amount of following posts (10%-30%)
            const followingCount = Math.floor(
                Math.random() * (limit * 0.3 - limit * 0.1) + limit * 0.1
            );

            const followingPosts = await this.getFollowingPosts(followingCount);

            tmpPosts.push(...followingPosts);

            this.loaded_post_ids.push(...followingPosts.map((post) => post.id));

            // Select 25% randomly
            let randomCount = Math.floor(limit * 0.25);

            // Get the 3 favourite categories of the user
            const categories = await UserInterests.getUserInterests(
                this.user_id,
                3
            );

            const categoryCounts = [0, 0, 0];

            if (categories.length < 3) {
                switch (categories.length) {
                    case 0:
                        randomCount = limit - followingCount;
                        break;
                    case 1:
                        // Random count is 40% of the limit
                        randomCount = limit - followingCount - limit * 0.4;
                        // The first element is the remaining
                        categoryCounts[0] =
                            limit - followingCount - randomCount;
                        break;
                    case 2:
                        // Random count is 30% of the limit
                        randomCount = limit - followingCount - limit * 0.23;
                        // The first element is random between 10% and 50% of (limit - followingCount - randomCount)
                        categoryCounts[0] = Math.floor(
                            Math.random() *
                                (limit -
                                    followingCount -
                                    randomCount -
                                    limit * 0.1) +
                                limit * 0.1
                        );
                        // The second element is the remaining
                        categoryCounts[1] =
                            limit -
                            followingCount -
                            randomCount -
                            categoryCounts[0];
                        break;
                }
            }

            for (let i = 0; i < categories.length; i++) {
                const posts = await this.getPostsByCategory(
                    categories[i].category_id,
                    categoryCounts[i]
                );
                tmpPosts.push(...posts);
                this.loaded_post_ids.push(...posts.map((p) => p.id));
            }

            // Get the remaining random posts
            const randomPosts = await this.getPosts(randomCount);

            // tmpPosts.push(...randomPosts);
            this.loaded_post_ids.push(...randomPosts.map((p) => p.id));

            // Shuffle the posts and map them
            const posts = tmpPosts
                .sort(() => Math.random() - 0.5)
                .map((p) => new Post(p));

            // Return the posts
            return posts;
        } catch (err) {
            console.error(err);
            return [];
        }
    }
}
