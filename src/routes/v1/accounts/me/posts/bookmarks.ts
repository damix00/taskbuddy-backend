// GET /v1/accounts/me/posts/bookmarks - Get all bookmarked posts of the current user

import { Response } from "express";
import { authorize } from "../../../../../middleware/authorization";
import { requireMethod } from "../../../../../middleware/require_method";
import { ExtendedRequest } from "../../../../../types/request";
import { PostReads } from "../../../../../database/wrappers/posts/post/wrapper";
import { getPostResultResponse } from "../../../posts/responses";

export default [
    authorize(true),
    requireMethod("GET"),
    async (req: ExtendedRequest, res: Response) => {
        try {
            const { offset } = req.query;

            if (isNaN(parseInt(offset as string))) {
                res.status(400).send({ message: "Invalid offset" });
                return;
            }

            const offsetInt = parseInt(offset as string);

            const posts = await PostReads.getUserBookmarks(
                req.user!.id,
                offsetInt
            );

            if (!posts) {
                res.status(404).send({ message: "No posts found" });
                return;
            }

            res.status(200).json({
                posts: posts.map((post) =>
                    getPostResultResponse(post, req.user!)
                ),
            });
        } catch (e) {
            console.error(e);
            res.status(500).send({ message: "Internal server error" });
        }
    },
];
