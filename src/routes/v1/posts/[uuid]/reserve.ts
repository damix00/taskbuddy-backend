// PUT/DELETE /v1/posts/:uuid/reserve
// Reserve/unreserve a post

import { Response } from "express";
import { PostReads } from "../../../../database/wrappers/posts/post/wrapper";
import { authorize } from "../../../../middleware/authorization";
import { requireMethods } from "../../../../middleware/require_method";
import { ExtendedRequest } from "../../../../types/request";

export default [
    requireMethods(["PUT", "DELETE"]),
    authorize(true),
    async (req: ExtendedRequest, res: Response) => {
        try {
            const post = await PostReads.getPostByUUID(req.params.uuid);

            if (!post) {
                return res.status(404).json({
                    message: "Post not found",
                });
            }

            if (post.user_id != req.user!.id) {
                return res.status(403).json({
                    message: "Forbidden",
                });
            }

            if (req.method === "PUT") {
                if (post.reserved) {
                    return res.status(400).json({
                        message: "Post is already reserved",
                    });
                }

                const result = await post.reserve();

                if (!result) {
                    console.error("Failed to reserve post");

                    return res.status(500).json({
                        message: "Internal server error",
                    });
                }

                return res.status(200).json({
                    message: "OK",
                });
            } else if (req.method === "DELETE") {
                if (!post.reserved) {
                    return res.status(400).json({
                        message: "Post is not reserved",
                    });
                }

                const result = await post.cancelReservation();

                if (!result) {
                    console.error("Failed to unreserve post");

                    return res.status(500).json({
                        message: "Internal server error",
                    });
                }

                return res.status(200).json({
                    message: "OK",
                });
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
