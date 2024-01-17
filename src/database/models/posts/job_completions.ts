import { ChannelFields } from "../chats/channels";
import { UserFields } from "../users/user";
import { PostFields } from "./post";

export interface JobCompletionFields {
    id: number;
    channel_id: number;
    post_id: number;
    completed_for_id: number;
    completed_by_id: number;
    completed_at: Date;
    created_at: Date;
    updated_at: Date;
}

// Interface for a job completion with all its relations
export interface JobCompletionWithRelations extends JobCompletionFields {
    channel: ChannelFields;
    post: PostFields;
    completed_for: UserFields;
    completed_by: UserFields;
}

export interface JobCompletionModel extends JobCompletionWithRelations {
    update: (fields: Partial<JobCompletionWithRelations>) => Promise<boolean>;
    deleteJobCompletion: () => Promise<boolean>;
}
