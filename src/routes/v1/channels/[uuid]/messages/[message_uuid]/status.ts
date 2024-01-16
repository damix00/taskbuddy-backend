// PATCH /v1/channels/:uuid/messages/:message_uuid/worker
// Update the status of a request message (if it exists)

import { Response } from "express";
import { authorize } from "../../../../../../middleware/authorization";
import { MessageRequest, withMessage } from "./middleware";
import {
    RequestMessageStatus,
    RequestMessageType,
} from "../../../../../../database/models/chats/messages";
import { getChannelResponse, getMessageResponse } from "../../../responses";
import { withChannel } from "../../middleware";
import { ChannelStatus } from "../../../../../../database/models/chats/channels";

async function handleDeal(req: MessageRequest, res: Response, action: string) {
    let success = false;

    if (action == "accept") {
        success =
            (await req.message!.acceptRequest()) &&
            (await req.channel!.setStatus(ChannelStatus.ACCEPTED));

        await req.channel!.post.reserve(req.user!.id);
    } else {
        success =
            (await req.message!.rejectRequest()) &&
            (await req.channel!.setStatus(ChannelStatus.REJECTED));
    }

    if (!success) {
        return res.status(500).json({
            message: "Internal server error",
        });
    }

    req.channel?.created_by.sendSocketEvent("channel_update", {
        channel: getChannelResponse(req.channel!, req.channel!.created_by),
    });

    req.channel?.recipient.sendSocketEvent("channel_update", {
        channel: getChannelResponse(req.channel!, req.channel!.recipient),
    });
}

async function handlePrice(req: MessageRequest, res: Response, action: string) {
    let success = false;
    let data = JSON.parse(req.message!.request!.data!);

    if (action == "accept") {
        success = await req.message!.acceptRequest();
        await req.channel!.setNegotiatedPrice(parseFloat(data["price"]));
    } else {
        success = await req.message!.rejectRequest();
    }

    if (!success) {
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

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

            if (message.request.request_type == RequestMessageType.DEAL) {
                await handleDeal(req, res, action);
            } else if (
                message.request.request_type == RequestMessageType.PRICE
            ) {
                await handlePrice(req, res, action);
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
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Internal server error" });
        }
    },
];
