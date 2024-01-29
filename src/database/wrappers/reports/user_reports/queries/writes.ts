import { executeQuery } from "../../../../connection";

namespace writes {
    export async function createReport(
        user_id: number,
        content_type: number,
        content_id: number,
        reason: string
    ): Promise<boolean> {
        try {
            const q = `
                INSERT INTO user_reports (
                    user_id,
                    content_type,
                    content_id,
                    reason
                ) VALUES (
                    $1,
                    $2,
                    $3,
                    $4
                ) RETURNING id
            `;

            const r = await executeQuery(q, [
                user_id,
                content_type,
                content_id,
                reason,
            ]);

            return r.length > 0;
        } catch (err) {
            console.error(err);

            return false;
        }
    }
}

export default writes;
