// GET /v1/sessions/:id/posts
// Get posts from a scroll session.

import { Response } from "express";
import { authorize } from "../../../../middleware/authorization";
import { requireMethod } from "../../../../middleware/require_method";
import { SessionRequest, withSession } from "../middleware";
import {
    SessionFilters,
    SessionType,
} from "../../../../database/models/algorithm/scroll_sessions";
import { FeedAlgorithm } from "../../../../database/wrappers/algorithm/feed_algorithm";
import { getPostResultResponse } from "../../posts/responses";
import { UserSessionsWrapper } from "../../../../database/wrappers/algorithm/sessions_wrapper";

export default [
    requireMethod("GET"),
    authorize(true),
    withSession,
    async (req: SessionRequest, res: Response) => {
        try {
            const filters = JSON.parse(req.session!.filters) as SessionFilters;

            if (!filters) {
                res.status(500).json({
                    message: "Internal server error",
                });
                return;
            }

            const algorithm = new FeedAlgorithm(
                filters,
                req.session!.id,
                req.user!.id,
                req.session!.lat || 0,
                req.session!.lon || 0,
                req.loaded_post_ids
            );

            if (filters.type == SessionType.FOLLOWING) {
                const posts = await algorithm.getFollowingPosts();

                if (posts.length > 0) {
                    await UserSessionsWrapper.addSessionPosts(
                        req.session!.id,
                        posts.map((post) => post.id)
                    );
                }

                res.status(200).json({
                    message: "Posts retrieved",
                    posts: posts.map((post) =>
                        getPostResultResponse(post, req.user!)
                    ),
                });
                return;
            }

            const posts = await algorithm.getSuggestedPosts();

            if (posts.length > 0) {
                await UserSessionsWrapper.addSessionPosts(
                    req.session!.id,
                    posts.map((post) => post.id)
                );
            }

            res.status(200).json({
                message: "Posts retrieved",
                posts: posts.map((post) =>
                    getPostResultResponse(post, req.user!)
                ),
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
