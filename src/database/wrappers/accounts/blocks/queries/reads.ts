import { executeQuery } from "../../../../connection";
import { BlocksFields } from "../../../../models/users/blocks";
import { ProfileFields } from "../../../../models/users/profile";
import { UserFields } from "../../../../models/users/user";

namespace reads {
    export async function getBlockById(
        id: number
    ): Promise<BlocksFields | null> {
        try {
            const q = `
                SELECT *
                FROM blocks
                WHERE id = $1;
            `;

            const result = await executeQuery<BlocksFields>(q, [id]);

            if (result.length === 0) return null;

            return {
                id: parseInt(result[0].id as any),
                blocker: parseInt(result[0].blocker as any),
                blocked: parseInt(result[0].blocked as any),
                created_at: result[0].created_at,
            };
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    export async function isBlocked(
        user_id: number,
        other_user_id: number
    ): Promise<boolean> {
        try {
            const q = `
                SELECT EXISTS (
                    SELECT 1
                    FROM blocks
                    WHERE blocker = $1 AND blocked = $2
                )
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

    export async function getBlocks(
        user_id: number,
        offset: number = 0,
        limit: number = 20
    ): Promise<
        | {
              user: UserFields;
              profile: ProfileFields;
          }[]
        | null
    > {
        try {
            const q = `
                SELECT
                    TO_JSON(users.*) as user,
                    TO_JSON(profiles.*) as profile
                FROM blocks
                LEFT JOIN users ON users.id = blocks.blocked
                LEFT JOIN profiles ON profiles.user_id = users.id
                WHERE blocks.blocker = $1
                ORDER BY blocks.created_at DESC
                OFFSET $2 LIMIT 20
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

    export async function isEitherBlocked(
        user_id: number,
        other_user_id: number
    ): Promise<boolean> {
        try {
            const q = `
                SELECT EXISTS (
                    SELECT 1
                    FROM blocks
                    WHERE blocker = $1 AND blocked = $2
                ) OR EXISTS (
                    SELECT 1
                    FROM blocks
                    WHERE blocker = $2 AND blocked = $1
                ) AS exists
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
}

export default reads;
