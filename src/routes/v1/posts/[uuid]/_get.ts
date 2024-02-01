// GET /v1/posts/:uuid
// Returns a post by its UUID

import { Response } from "express";
import { ExtendedRequest } from "../../../../types/request";
import { PostReads } from "../../../../database/wrappers/posts/post/wrapper";
import { getPostResponse } from "../responses";

export default async (req: ExtendedRequest, res: Response) => {
    try {
        const { uuid } = req.params;

        const post = await PostReads.getPostByUUID(uuid, req.user!.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found",
            });
        }

        const user = await post.getUser();
        const profile = await user?.getProfile();

        if (!user || !profile) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.status(200).json(
            getPostResponse(
                post,
                user,
                profile,
                post.following,
                post.user_id === req.user!.id,
                post.liked,
                post.bookmarked
            )
        );

        await post.addImpression();
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};
