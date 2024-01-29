// POST /v1/channels/:uuid/messages/send
// Sends a message to a channel

import { Response, request } from "express";
import { authorize } from "../../../../../middleware/authorization";
import { requireMethod } from "../../../../../middleware/require_method";
import { ChannelRequest, withChannel } from "../middleware";
import { BlockReads } from "../../../../../database/wrappers/accounts/blocks/wrapper";
import { getMessageResponse } from "../../responses";
import { ChannelStatus } from "../../../../../database/models/chats/channels";

export default [
    requireMethod("POST"),
    authorize(true),
    withChannel,
    async (req: ChannelRequest, res: Response) => {
        try {
            const { content } = req.body;

            const attachments = req.files;

            if (!content || content.length == 0 || content.length > 2000) {
                res.status(400).json({
                    error: "Missing content",
                });
                return;
            }

            if (req.channel!.status == ChannelStatus.REJECTED) {
                res.status(403).json({
                    error: "Couldn't send message",
                });
                return;
            }

            const isChannelCreator = req.channel!.created_by_id == req.user!.id;
            const otherUser = isChannelCreator
                ? req.channel!.recipient
                : req.channel!.created_by;

            // Check if the user is blocked by the channel creator or vice versa
            if (await BlockReads.isEitherBlocked(req.user!.id, otherUser.id)) {
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
                message: getMessageResponse(
                    result,
                    req.user!,
                    req.channel!.uuid
                ),
            });

            // Send push notification
            await otherUser.sendNotification({
                title: `${req.user!.first_name} ${req.user!.last_name}`,
                body:
                    content.length > 50
                        ? content.slice(0, 50) + "..."
                        : content,
                imageUrl:
                    req.profile!.profile_picture?.length > 0
                        ? req.profile!.profile_picture
                        : undefined,
                data: {
                    type: "message",
                    channel_uuid: req.channel!.uuid,
                    message_uuid: result.uuid,
                },
            });

            otherUser.sendSocketEvent("chat", {
                message: getMessageResponse(
                    result,
                    otherUser,
                    req.channel!.uuid
                ),
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                error: "Internal server error",
            });
        }
    },
];
