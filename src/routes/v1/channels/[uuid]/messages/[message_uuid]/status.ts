// PATCH /v1/channels/:uuid/messages/:message_uuid/status
// Update the status of a request message (if it exists)

import { Response } from "express";
import { authorize } from "../../../../../../middleware/authorization";
import { MessageRequest, withMessage } from "./middleware";
import { RequestMessageStatus } from "../../../../../../database/models/chats/messages";
import { getChannelResponse, getMessageResponse } from "../../../responses";
import { withChannel } from "../../middleware";
import { ChannelStatus } from "../../../../../../database/models/chats/channels";

export default [
    authorize(true),
    withChannel,
    withMessage,
    async (req: MessageRequest, res: Response) => {
        try {
            const action = req.query.action;

            if (!action || typeof action !== "string") {
                return res.status(400).json({
                    message: "Missing query parameter 'action'",
                });
            }

            if (action != "accept" && action != "reject") {
                return res.status(400).json({
                    message: "Invalid query parameter 'action'",
                });
            }

            const message = req.message!;

            if (!message.request) {
                return res.status(400).json({
                    message: "Message is not a request",
                });
            }

            if (message.sender_id == req.user!.id) {
                return res.status(403).json({
                    message: "You cannot change your own request status",
                });
            }

            if (message.request.status != RequestMessageStatus.PENDING) {
                return res.status(403).json({
                    message: "Request is not pending",
                });
            }

            let success = false;

            if (action == "accept") {
                success = await message.acceptRequest();

                await req.channel!.post.reserve(req.user!.id);
                await req.channel!.setStatus(ChannelStatus.ACCEPTED);
            } else {
                success = await message.rejectRequest();

                await req.channel!.setStatus(ChannelStatus.REJECTED);
            }

            if (!success) {
                return res.status(500).json({
                    message: "Internal server error",
                });
            }

            res.status(200).json({
                message: "Success",
            });

            req.user!.sendSocketEvent("message_updated", {
                channel_uuid: req.channel!.uuid,
                message: getMessageResponse(
                    req.message!,
                    req.user!,
                    req.channel!.uuid
                ),
            });

            req.channel!.getOtherUser(req.user!.id).sendSocketEvent(
                "message_updated",
                {
                    channel_uuid: req.channel!.uuid,
                    message: getMessageResponse(
                        req.message!,
                        req.channel!.getOtherUser(req.user!.id),
                        req.channel!.uuid
                    ),
                }
            );

            req.channel?.created_by.sendSocketEvent("channel_update", {
                channel: getChannelResponse(
                    req.channel!,
                    req.channel!.created_by
                ),
            });

            req.channel?.recipient.sendSocketEvent("channel_update", {
                channel: getChannelResponse(
                    req.channel!,
                    req.channel!.recipient
                ),
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Internal server error" });
        }
    },
];
