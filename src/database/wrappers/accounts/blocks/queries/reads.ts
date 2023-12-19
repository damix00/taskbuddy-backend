import { executeQuery } from "../../../../connection";
import { BlocksFields } from "../../../../models/users/blocks";

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

    export async function hasUserBlocked(
        blocker: number,
        blocked: number
    ): Promise<boolean> {
        try {
            const q = `
                SELECT EXISTS (
                    SELECT 1
                    FROM blocks
                    WHERE blocker = $1 AND blocked = $2
                );
            `;

            const result = await executeQuery<{ exists: boolean }>(q, [
                blocker,
                blocked,
            ]);

            if (result.length === 0) return false;

            return result[0].exists;
        } catch (err) {
            console.error(err);
            return false;
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
                ) OR EXISTS (
                    SELECT 1
                    FROM blocks
                    WHERE blocker = $2 AND blocked = $1
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

    export async function getBlocks(
        user_id: number,
        offset: number = 0
    ): Promise<number[]> {
        try {
            const q = `
                SELECT blocked
                FROM blocks
                WHERE blocker = $1
                ORDER BY created_at DESC
                OFFSET $2
            `;

            const result = await executeQuery<{ blocked: number }>(q, [
                user_id,
                offset,
            ]);

            return result.map((r) => r.blocked);
        } catch (err) {
            console.error(err);
            return [];
        }
    }
}

export default reads;
