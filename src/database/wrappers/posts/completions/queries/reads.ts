import { executeQuery } from "../../../../connection";
import { JobCompletionFields } from "../../../../models/posts/job_completions";

namespace reads {
    export async function isJobCompleted(
        post_id: number,
        completed_by_id: number
    ): Promise<boolean> {
        try {
            const q = `
                SELECT * FROM job_completions
                WHERE post_id = $1 AND completed_by_id = $2;
            `;

            const r = await executeQuery<JobCompletionFields>(q, [
                post_id,
                completed_by_id,
            ]);

            return r.length > 0;
        } catch (e) {
            console.error(e);
            return false;
        }
    }
}

export default reads;
