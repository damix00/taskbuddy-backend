// GET /v1/channels/posts/:post_uuid
// This is to check if there is a channel between the user and the post owner.

import { Response } from "express";
import { authorize } from "../../../../../middleware/authorization";
import { ExtendedRequest } from "../../../../../types/request";
import { ChannelReads } from "../../../../../database/wrappers/chats/channels/wrapper";

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

            const exists = await ChannelReads.getChannelByPostId(
                post_uuid as any,
                req.user!.id
            );

            if (!exists) {
                return res.status(404).json({
                    message: "Channel not found",
                });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
