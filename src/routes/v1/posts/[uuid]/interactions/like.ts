// PUT/DELETE /v1/posts/:uuid/interactions/like

import { Response } from "express";
import { authorize } from "../../../../../middleware/authorization";
import { ExtendedRequest } from "../../../../../types/request";
import { PostReads } from "../../../../../database/wrappers/posts/post/wrapper";
import { Interactions } from "../../../../../database/wrappers/posts/interactions";
import { requireMethods } from "../../../../../middleware/require_method";
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
                return res.status(400).json({ message: "Invalid post UUID" });
            }

            const post = await PostReads.getPostByUUID(uuid);

            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }

            if (req.method === "PUT") {
                if (await post.addLike(req.user!.id)) {
                    res.status(200).json({ message: "Post liked" });

                    UserInterests.incrementInterestValue(
                        req.user!.id,
                        post.classified_category,
                        InterestValues.LIKE
                    );

                    return;
                }

                return res.status(403).json({ message: "Forbidden" });
            } else if (req.method === "DELETE") {
                if (await post.removeLike(req.user!.id)) {
                    res.status(200).json({ message: "Post unliked" });

                    UserInterests.incrementInterestValue(
                        req.user!.id,
                        post.classified_category,
                        InterestValues.UNLIKE
                    );

                    return;
                }

                return res.status(403).json({ message: "Forbidden" });
            }

            return res.status(405).json({ message: "Method not allowed" });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Internal server error" });
        }
    },
];
