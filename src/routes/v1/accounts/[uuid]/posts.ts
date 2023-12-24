// GET /v1/accounts/[uuid]/posts
// Returns a list of posts by the user with the given UUID.

import { Response } from "express";
import { authorize } from "../../../../middleware/authorization";
import { requireMethod } from "../../../../middleware/require_method";
import { ExtendedRequest } from "../../../../types/request";
import { PostReads } from "../../../../database/wrappers/posts/post/wrapper";
import { UserReads } from "../../../../database/wrappers/accounts/users/wrapper";
import { getPostResultResponse } from "../../posts/responses";

export default [
    authorize(true),
    requireMethod("GET"),
    async (req: ExtendedRequest, res: Response) => {
        try {
            const { uuid, offset } = req.params;

            if (!uuid) {
                return res.status(400).json({
                    message: "Missing required parameters",
                });
            }

            if (isNaN(parseInt(offset))) {
                return res.status(400).json({
                    message: "Invalid offset",
                });
            }

            if (uuid == req.user!.uuid) {
                return res.status(403).json({
                    message: "You cannot view your own posts",
                });
            }

            const user = await UserReads.getUserByUUID(uuid, req.user!.id);

            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            const posts = await PostReads.getPostsByUser(
                user.id,
                parseInt(offset)
            );

            if (!posts) {
                return res.status(404).json({
                    message: "No posts found",
                });
            }
        } catch (error) {
            return res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
