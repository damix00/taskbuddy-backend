// DELETE /v1/posts/:uuid
// Deletes a post by its UUID

import { Response } from "express";
import { ExtendedRequest } from "../../../../types/request";
import { PostReads } from "../../../../database/wrappers/posts/post/wrapper";

export default async (req: ExtendedRequest, res: Response) => {
    const { uuid } = req.params;

    const post = await PostReads.getPostByUUID(uuid, req.user!.id);

    if (!post) {
        return res.status(404).json({
            error: "Post not found",
        });
    }

    try {
        let r = await post.deletePost();

        if (!r) {
            return res.status(500).json({
                error: "Internal server error",
            });
        }

        res.status(200).json({
            message: "Post deleted",
        });
    } catch (e) {
        return res.status(500).json({
            error: "Internal server error",
        });
    }
};
