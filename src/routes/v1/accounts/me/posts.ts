// GET /v1/accounts/me/posts - Get all posts of the current user

import { Response } from "express";
import { authorize } from "../../../../middleware/authorization";
import { ExtendedRequest } from "../../../../types/request";
import { PostReads } from "../../../../database/wrappers/posts/post/wrapper";

export default [
    authorize(true),
    async (req: ExtendedRequest, res: Response) => {
        try {
            const offset = parseInt(req.query.offset as string) || 0;

            const posts = await PostReads.getPostsByUser(req.user!.id, offset);

            if (!posts) {
                return res.status(404).json({
                    message: "No posts found",
                });
            }

            return res.status(200).json({
                message: "Successfully retrieved posts",
                posts,
            });
        } catch (e) {
            console.error(e);

            return res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
