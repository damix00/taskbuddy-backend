import { executeQuery } from "../../../../connection";

namespace writes {
    export async function block(
        blocker: number,
        blocked: number
    ): Promise<boolean> {
        try {
            const q = `
                INSERT INTO blocks (blocker, blocked)
                VALUES ($1, $2);
            `;

            await executeQuery(q, [blocker, blocked]);

            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    export async function unblock(
        blocker: number,
        blocked: number
    ): Promise<boolean> {
        try {
            const q = `
                DELETE FROM blocks
                WHERE blocker = $1 AND blocked = $2;
            `;

            await executeQuery(q, [blocker, blocked]);

            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    export async function updateBlock(follow: {
        id: number;
        blocker: number;
        blocked: number;
    }): Promise<boolean> {
        try {
            const q = `
                UPDATE blocks
                SET blocker = $1, blocked = $2
                WHERE id = $3;
            `;

            await executeQuery(q, [follow.blocker, follow.blocked, follow.id]);

            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
}

export default writes;
