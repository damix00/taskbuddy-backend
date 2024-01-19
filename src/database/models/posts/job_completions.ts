import { User } from "../../wrappers/accounts/users";
import Channel from "../../wrappers/chats/channels";
import Post from "../../wrappers/posts/post";
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

export interface JobCompletionCreationFields {
    channel: Channel;
    post: Post;
    completed_for: User;
    completed_by: User;
}

// Interface for a job completion with all its relations
export interface JobCompletionWithRelations extends JobCompletionFields {
    channel: ChannelFields;
    post: PostFields;
    completed_for: UserFields;
    completed_by: UserFields;
}
