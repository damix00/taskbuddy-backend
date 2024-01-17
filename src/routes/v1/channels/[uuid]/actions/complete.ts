// POST /v1/channels/:uuid/actions/cancel

import { Response, Router } from "express";
import { requireMethod } from "../../../../../middleware/require_method";
import { authorize } from "../../../../../middleware/authorization";
import { ChannelRequest, withChannel } from "../middleware";
import { getChannelResponse, getMessageResponse } from "../../responses";
import { ChannelStatus } from "../../../../../database/models/chats/channels";
import { RequestMessageType } from "../../../../../database/models/chats/messages";

export default [
    requireMethod("POST"),
    authorize(true),
    withChannel,
    async (req: ChannelRequest, res: Response) => {
        try {
            const isEmployee = req.channel!.post.user_id == req.user!.id;

            if (!isEmployee) {
                return res.status(403).json({
                    message: "You are not authorized to complete this job.",
                });
            }

            if (
                req.channel!.status != ChannelStatus.ACCEPTED &&
                req.channel!.status != ChannelStatus.COMPLETED
            ) {
                return res.status(403).json({
                    message: "You cannot complete this job.",
                });
            }

            const message = await req.channel!.sendMessage(
                {
                    sender_id: req.user!.id,
                    channel_id: req.channel!.id,
                    message: "",
                    request: {
                        request_type: RequestMessageType.COMPLETE,
                        request_data: JSON.stringify({
                            left_review: false,
                        }),
                    },
                    attachments: [],
                    system_message: false,
                },
                req.user!,
                req.profile!.profile_picture
            );

            if (!message) {
                return res.status(500).json({
                    message: "Internal server error",
                });
            }

            const otherUser = req.channel!.getOtherUser(req.user!.id);

            // Send socket event
            otherUser.sendSocketEvent("chat", {
                message: getMessageResponse(
                    message!,
                    otherUser,
                    req.channel!.uuid
                ),
            });

            req.channel!.setLastMessageTime(new Date());

            res.status(200).json({
                message: getMessageResponse(
                    message!,
                    req.user!,
                    req.channel!.uuid
                ),
            });

            await req.channel!.getOtherUser(req.user!.id).sendNotification({
                title: req.channel!.post!.title,
                body: `This job has been completed by @${req.user!.username}.`,
                data: {
                    type: "message",
                    channel_uuid: req.channel!.uuid,
                },
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
