// POST /v1/channels/:uuid/actions/cancel

import { Response, Router } from "express";
import { requireMethod } from "../../../../../middleware/require_method";
import { authorize } from "../../../../../middleware/authorization";
import { ChannelRequest, withChannel } from "../middleware";
import { getChannelResponse, getMessageResponse } from "../../responses";

export default [
    requireMethod("POST"),
    authorize(true),
    withChannel,
    async (req: ChannelRequest, res: Response) => {
        try {
            await req.channel!.cancel();
            await req.channel!.post.cancelReservation();

            const isEmployee = req.channel!.post.user_id == req.user!.id;

            if (isEmployee) {
                await req.profile!.setCancelledEmployee(
                    req.profile!.cancelled_employee + 1
                );
            } else {
                await req.profile!.setCancelledEmployer(
                    req.profile!.cancelled_employee + 1
                );
            }

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

            const message = await req.channel!.sendMessage(
                {
                    message: `This job has been cancelled by ${
                        req.user!.first_name
                    } ${req.user!.last_name}.`,
                    system_message: true,
                    channel_id: req.channel!.id,
                },
                null
            );

            res.status(200).json({
                message: "Channel canceled",
                channel: getChannelResponse(req.channel!, req.user!),
            });

            if (message) {
                // Send socket event to all users in the channel
                const otherUser = req.channel!.getOtherUser(req.user!.id);

                otherUser.sendSocketEvent("chat", {
                    message: getMessageResponse(
                        message!,
                        otherUser,
                        req.channel!.uuid
                    ),
                });

                req.user!.sendSocketEvent("chat", {
                    message: getMessageResponse(
                        message!,
                        req.user!,
                        req.channel!.uuid
                    ),
                });
            }

            await req.channel!.getOtherUser(req.user!.id).sendNotification({
                title: req.channel!.post!.title,
                body: `This job has been canceled by @${req.user!.username}.`,
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
