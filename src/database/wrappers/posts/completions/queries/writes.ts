import { executeQuery } from "../../../../connection";
import {
    JobCompletionCreationFields,
    JobCompletionFields,
    JobCompletionWithRelations,
} from "../../../../models/posts/job_completions";

namespace writes {
    export async function addPostCompletion(
        data: JobCompletionCreationFields
    ): Promise<JobCompletionWithRelations | null> {
        try {
            const q = `
                INSERT INTO job_completions (
                    channel_id,
                    post_id,
                    completed_for_id,
                    completed_by_id
                ) VALUES (
                    $1, $2, $3, $4
                ) RETURNING *;
            `;

            const r = await executeQuery<JobCompletionFields>(q, [
                data.channel.id,
                data.post.id,
                data.completed_for.id,
                data.completed_by.id,
            ]);

            if (r.length == 0) {
                return null;
            }

            // Return all relations to make it easier to work with
            return {
                ...r[0],
                channel: data.channel,
                post: data.post,
                completed_for: data.completed_for,
                completed_by: data.completed_by,
            };
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    export async function updatePostCompletion(
        data: JobCompletionWithRelations
    ): Promise<boolean> {
        try {
            const q = `
                UPDATE job_completions SET
                    channel_id = $1,
                    post_id = $2,
                    completed_for_id = $3,
                    completed_by_id = $4
                WHERE id = $5;
            `;

            await executeQuery<JobCompletionFields>(q, [
                data.channel.id,
                data.post.id,
                data.completed_for.id,
                data.completed_by.id,
                data.id,
            ]);

            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }
}

export default writes;
