import { DataModel } from "../../../data_model";
import {
    PostComments,
    PostCommentsModel,
} from "../../../models/posts/comments";

class Comment extends DataModel implements PostCommentsModel {
    id: number;
    post_id: number;
    user_id: number;
    comment: string;
    created_at: Date;
    likes: number;
    reply_count: number;
    is_reply: boolean;
    reply_to: number;

    constructor(comment: PostComments, refetchOnUpdate: boolean = true) {
        super(refetchOnUpdate);

        Object.assign(this, comment);
        this.refetchOnUpdate = refetchOnUpdate;
    }

    public async deleteComment(): Promise<boolean> {
        return true;
    }

    public async addLike(user_id: number): Promise<boolean> {
        return true;
    }

    public async removeLike(user_id: number): Promise<boolean> {
        return true;
    }

    public async addReply(reply: {
        user_id: number;
        comment: string;
        reply_to: number;
    }): Promise<boolean> {
        return true;
    }

    public async removeReply(reply_id: number): Promise<boolean> {
        return true;
    }
}

export default Comment;
