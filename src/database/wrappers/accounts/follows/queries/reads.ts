import { executeQuery } from "../../../../connection";
import { FollowsFields } from "../../../../models/users/follows";
import { ProfileFields } from "../../../../models/users/profile";
import { UserFields } from "../../../../models/users/user";

namespace reads {
    // Get a follow by the ID
    export async function getFollowById(id: number) {
        try {
            const q = `
                SELECT *
                FROM follows
                WHERE id = $1;
            `;

            const result = await executeQuery<FollowsFields>(q, [id]);

            if (result.length === 0) return null;

            return {
                id: parseInt(result[0].id as any),
                follower: parseInt(result[0].follower as any),
                following: parseInt(result[0].following as any),
                created_at: result[0].created_at,
            };
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    // Check if user1 follows user2
    export async function isFollowing(
        follower: number,
        following: number
    ): Promise<boolean> {
        try {
            const q = `
                SELECT EXISTS (
                    SELECT 1
                    FROM follows
                    WHERE follower = $1 AND following = $2
                );
            `;

            const result = await executeQuery<{ exists: boolean }>(q, [
                follower,
                following,
            ]);

            if (result.length === 0) return false;

            return result[0].exists;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    // Check if user1 follows user2 and vice versa
    export async function isMutual(
        user_id: number,
        other_user_id: number
    ): Promise<boolean> {
        try {
            const q = `
                SELECT EXISTS (
                    SELECT 1
                    FROM follows
                    WHERE follower = $1 AND following = $2
                ) AND EXISTS (
                    SELECT 1
                    FROM follows
                    WHERE follower = $2 AND following = $1
                );
            `;

            const result = await executeQuery<{ exists: boolean }>(q, [
                user_id,
                other_user_id,
            ]);

            if (result.length === 0) return false;

            return result[0].exists;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    // Get the followers of a user
    export async function getFollowers(
        user_id: number,
        offset: number = 0
    ): Promise<number[]> {
        try {
            const q = `
                SELECT follower
                FROM follows
                WHERE following = $1
                ORDER BY created_at DESC
                OFFSET $2
            `;

            const result = await executeQuery<{ follower: number }>(q, [
                user_id,
                offset,
            ]);

            return result.map((r) => r.follower);
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    // Mutual follows
    export async function getFriends(
        user_id: number,
        offset: number = 0
    ): Promise<
        {
            user: UserFields;
            profile: ProfileFields;
        }[]
    > {
        try {
            const q = `
                SELECT TO_JSON(users.*) AS user, TO_JSON(profiles.*) AS profile
                FROM follows
                LEFT JOIN users ON users.id = follows.following
                LEFT JOIN profiles ON profiles.user_id = follows.following
                WHERE follower = $1 AND follows.following IN (
                    SELECT follower
                    FROM follows
                    WHERE following = $1
                )
                ORDER BY follows.created_at DESC
                OFFSET $2
            `;

            const result = await executeQuery<{
                user: UserFields;
                profile: ProfileFields;
            }>(q, [user_id, offset]);

            return result;
        } catch (err) {
            console.error(err);
            return [];
        }
    }
}

export default reads;
