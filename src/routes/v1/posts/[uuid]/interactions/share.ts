// PUT /v1/posts/:uuid/interactions/share
// Add a share to a post

import { Response } from "express";
import { authorize } from "../../../../../middleware/authorization";
import { requireMethod } from "../../../../../middleware/require_method";
import { ExtendedRequest } from "../../../../../types/request";
import { PostReads } from "../../../../../database/wrappers/posts/post/wrapper";

export default [
    authorize(true),
    requireMethod("PUT"),
    async (req: ExtendedRequest, res: Response) => {
        try {
            const { uuid } = req.params;

            if (!uuid) {
                return res.status(400).json({ message: "Missing UUID" });
            }

            const post = await PostReads.getPostByUUID(uuid);

            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }

            if (post.user_id == req.user!.id) {
                return res
                    .status(400)
                    .json({ message: "Cannot share own post" });
            }

            if (!(await post.addShare())) {
                return res
                    .status(500)
                    .json({ message: "Internal server error" });
            }

            return res.status(200).json({ message: "Success" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
];
