import {
    JobCompletionCreationFields,
    JobCompletionWithRelations,
} from "../../../models/posts/job_completions";
import reads from "./queries/reads";
import writes from "./queries/writes";

export class JobCompletionReads {
    static async isJobCompleted(
        post_id: number,
        completed_by_id: number
    ): Promise<boolean> {
        return await reads.isJobCompleted(post_id, completed_by_id);
    }
}

export class JobCompletionWrites {
    static async addPostCompletion(
        data: JobCompletionCreationFields
    ): Promise<JobCompletionWithRelations | null> {
        return await writes.addPostCompletion(data);
    }

    static async updatePostCompletion(
        data: JobCompletionWithRelations
    ): Promise<boolean> {
        return await writes.updatePostCompletion(data);
    }
}
