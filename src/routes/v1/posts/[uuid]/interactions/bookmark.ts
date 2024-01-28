// PUT/DELETE /api/v1/posts/:uuid/interactions/bookmark
// Bookmark/unbookmark a post

import { Response } from "express";
import { authorize } from "../../../../../middleware/authorization";
import { requireMethods } from "../../../../../middleware/require_method";
import { ExtendedRequest } from "../../../../../types/request";
import { PostReads } from "../../../../../database/wrappers/posts/post/wrapper";
import {
    InterestValues,
    UserInterests,
} from "../../../../../database/wrappers/algorithm/user_interests_wrapper";

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
                res.status(404).json({ error: "Post not found" });
                return;
            }

            if (req.method === "PUT") {
                if (await post.addBookmark(req.user!.id)) {
                    res.status(200).json({ message: "Post bookmarked" });

                    UserInterests.incrementInterestValue(
                        req.user!.id,
                        post.classified_category,
                        InterestValues.BOOKMARK
                    );

                    return;
                }

                res.status(403).json({ message: "Forbidden" });
                return;
            } else if (req.method === "DELETE") {
                if (await post.removeBookmark(req.user!.id)) {
                    res.status(200).json({ message: "Post unbookmarked" });

                    UserInterests.incrementInterestValue(
                        req.user!.id,
                        post.classified_category,
                        InterestValues.UNBOOKMARK
                    );

                    return;
                }

                res.status(403).json({ message: "Forbidden" });
                return;
            }

            return res.status(405).json({ message: "Method not allowed" });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Something went wrong" });
        }
    },
];
