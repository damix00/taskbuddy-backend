// GET /v1/channels/posts/:post_uuid
// This is to check if there is a channel between the user and the post owner.

import { Response } from "express";
import { authorize } from "../../../../../middleware/authorization";
import { ExtendedRequest } from "../../../../../types/request";
import { ChannelReads } from "../../../../../database/wrappers/chats/channels/wrapper";
import { PostReads } from "../../../../../database/wrappers/posts/post/wrapper";
import { getChannelResponse } from "../../responses";

export default [
    authorize(true),
    async (req: ExtendedRequest, res: Response) => {
        try {
            const { post_uuid } = req.params;

            if (!post_uuid) {
                return res.status(400).json({
                    message: "Invalid post uuid",
                });
            }

            const post = await PostReads.getPostByUUID(post_uuid as any);

            if (!post) {
                return res.status(404).json({
                    message: "Post not found",
                });
            }

            const exists = await ChannelReads.getChannelByPostId(
                post.id,
                req.user!.id
            );

            if (!exists || exists.created_by_id != req.user!.id) {
                return res.status(404).json({
                    message: "Channel not found",
                });
            }

            res.status(200).json({
                message: "Success",
                channel: getChannelResponse(exists, req.user!),
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
