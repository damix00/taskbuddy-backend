// PUT/DELETE /api/v1/posts/:uuid/interactions/bookmark
// Bookmark/unbookmark a post

import { Response } from "express";
import { authorize } from "../../../../../middleware/authorization";
import { requireMethods } from "../../../../../middleware/require_method";
import { ExtendedRequest } from "../../../../../types/request";
import { PostReads } from "../../../../../database/wrappers/posts/post/wrapper";

export default [
    authorize(true),
    requireMethods(["PUT", "DELETE"]),
    async (req: ExtendedRequest, res: Response) => {
        try {
            const { uuid } = req.params;

            if (!uuid) {
                return res.status(400).json({ error: "Invalid post ID" });
            }

            const post = await PostReads.getPostByUUID(uuid);

            if (!post) {
                return res.status(404).json({ error: "Post not found" });
            }

            if (req.method === "PUT") {
                if (await post.addBookmark(req.user!.id)) {
                    return res.status(200).json({ message: "Post bookmarked" });
                }

                return res.status(403).json({ message: "Forbidden" });
            } else if (req.method === "DELETE") {
                if (await post.removeBookmark(req.user!.id)) {
                    return res
                        .status(200)
                        .json({ message: "Post unbookmarked" });
                }

                return res.status(403).json({ message: "Forbidden" });
            }

            return res.status(405).json({ message: "Method not allowed" });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Something went wrong" });
        }
    },
];
