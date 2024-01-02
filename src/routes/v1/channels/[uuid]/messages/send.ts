// POST /v1/channels/:uuid/messages/send
// Sends a message to a channel

import { Response, request } from "express";
import { authorize } from "../../../../../middleware/authorization";
import { requireMethod } from "../../../../../middleware/require_method";
import { ChannelRequest, withChannel } from "../middleware";
import { BlockReads } from "../../../../../database/wrappers/accounts/blocks/wrapper";
import { getMessageResponse } from "../../responses";

export default [
    requireMethod("POST"),
    authorize(true),
    withChannel,
    async (req: ChannelRequest, res: Response) => {
        try {
            const { content, request_type } = req.body;

            const attachments = req.files;

            if (!content || content.length == 0 || content.length > 2000) {
                res.status(400).json({
                    error: "Missing content",
                });
                return;
            }

            if (request_type != undefined && isNaN(request_type)) {
                res.status(400).json({
                    error: "Invalid request type",
                });
                return;
            }

            const isChannelCreator = req.channel!.created_by_id == req.user!.id;
            const otherUser = isChannelCreator
                ? req.channel!.recipient
                : req.channel!.created_by;

            // Check if the user is blocked by the channel creator or vice versa
            if (
                (await BlockReads.isBlocked(req.user!.id, otherUser.id)) ||
                (await BlockReads.isBlocked(otherUser.id, req.user!.id))
            ) {
                res.status(403).json({
                    error: "Couldn't send message",
                });
                return;
            }

            // Send message
            const result = await req.channel!.sendMessage(
                {
                    sender_id: req.user!.id,
                    channel_id: req.channel!.id,
                    message: content,
                    system_message: false,
                    request: request_type ? { request_type } : undefined,
                    attachments: [],
                },
                req.user!,
                req.profile!.profile_picture
            );

            if (!result) {
                res.status(500).json({
                    error: "Internal server error",
                });
                return;
            }

            // Send response
            res.status(200).json({
                message: getMessageResponse(result, req.user!),
            });

            // Send push notification
            await otherUser.sendNotification({
                title: "New message",
                body: `${req.user!.username} sent you a message`,
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                error: "Internal server error",
            });
        }
    },
];
