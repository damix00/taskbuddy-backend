// POST /v1/channels/:uuid/actions/negotiate/date
// Sends a request message to the worker to negotiate

import { Response, Router } from "express";
import { requireMethod } from "../../../../../../middleware/require_method";
import { authorize } from "../../../../../../middleware/authorization";
import { ChannelRequest, withChannel } from "../../middleware";
import { getChannelResponse, getMessageResponse } from "../../../responses";
import { RequestMessageType } from "../../../../../../database/models/chats/messages";

export default [
    requireMethod("POST"),
    authorize(true),
    withChannel,
    async (req: ChannelRequest, res: Response) => {
        try {
            const { date } = req.body;

            if (!date) {
                return res.status(400).json({
                    message: "Date is required",
                });
            }

            // Send a request message to the worker to accept
            const message = await req.channel!.sendMessage(
                {
                    sender_id: req.user!.id,
                    channel_id: req.channel!.id,
                    message: "",
                    request: {
                        request_type: RequestMessageType.DATE,
                        request_data: JSON.stringify({
                            date,
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

            // Send push notification
            await otherUser.sendNotification({
                title: `${req.user!.first_name} ${req.user!.last_name}`,
                body: "Wants to negotiate the date",
                imageUrl:
                    req.profile!.profile_picture?.length > 0
                        ? req.profile!.profile_picture
                        : undefined,
                data: {
                    type: "message",
                    channel_uuid: req.channel!.uuid,
                    message_uuid: message!.uuid,
                },
            });

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
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
