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
import { JobCompletionWrites } from "../../../../../../database/wrappers/posts/completions/wrapper";
import {
    InterestValues,
    UserInterests,
} from "../../../../../../database/wrappers/algorithm/user_interests_wrapper";

async function handleDeal(req: MessageRequest, res: Response, action: string) {
    let success = false;

    if (action == "accept") {
        success =
            (await req.message!.acceptRequest()) &&
            (await req.channel!.setStatus(ChannelStatus.ACCEPTED));

        await req.channel!.post.reserve();
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

async function handleDate(req: MessageRequest, res: Response, action: string) {
    let success = false;
    let data = JSON.parse(req.message!.request!.data!);

    if (action == "accept") {
        success = await req.message!.acceptRequest();
        await req.channel!.setNegotiatedDate(data["date"]);
    } else {
        success = await req.message!.rejectRequest();
    }

    if (!success) {
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

async function handleComplete(
    req: MessageRequest,
    res: Response,
    action: string
) {
    let success = false;

    if (action == "accept") {
        success = await req.message!.acceptRequest();
        await req.channel!.setStatus(ChannelStatus.COMPLETED);
        await req.channel!.post.complete();

        // Insert into post completions
        await JobCompletionWrites.addPostCompletion({
            channel: req.channel!,
            post: req.channel!.post,
            completed_for: req.channel!.created_by,
            completed_by: req.channel!.recipient,
        });

        const p = await req.channel!.getOtherUser(req.user!.id).getProfile();

        if (p) {
            await p.setCompletedEmployee(p.completed_employee + 1);
        }

        req.profile!.setCompletedEmployer(req.profile!.completed_employer + 1);

        req.channel?.created_by.sendSocketEvent("channel_update", {
            channel: getChannelResponse(req.channel!, req.channel!.created_by),
        });

        req.channel?.recipient.sendSocketEvent("channel_update", {
            channel: getChannelResponse(req.channel!, req.channel!.recipient),
        });

        UserInterests.incrementInterestValue(
            req.channel!.created_by.id,
            req.channel!.post.classified_category,
            InterestValues.COMPLETE
        );

        UserInterests.incrementInterestValue(
            req.channel!.recipient.id,
            req.channel!.post.classified_category,
            InterestValues.COMPLETE
        );
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
            } else if (
                message.request.request_type == RequestMessageType.DATE
            ) {
                await handleDate(req, res, action);
            } else if (
                message.request.request_type == RequestMessageType.COMPLETE
            ) {
                await handleComplete(req, res, action);
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
