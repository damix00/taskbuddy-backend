// POST /v1/channels/:uuid/messages/:message_uuid/review
// Leave a review for a channel (user)

import { Response } from "express";
import { requireMethod } from "../../../../../../middleware/require_method";
import { withChannel } from "../../middleware";
import { MessageRequest, withMessage } from "./middleware";
import { floatParser } from "../../../../../../middleware/parsers";
import { authorize } from "../../../../../../middleware/authorization";
import { ChannelStatus } from "../../../../../../database/models/chats/channels";
import {
    RequestMessageStatus,
    RequestMessageType,
} from "../../../../../../database/models/chats/messages";
import { ReviewWrites } from "../../../../../../database/wrappers/reviews/wrapper";
import { getReviewResponse } from "../../../../accounts/responses";
import { getMessageResponse } from "../../../responses";

export default [
    requireMethod("POST"),
    authorize(true),
    floatParser(["rating"]),
    withChannel,
    withMessage,
    async (req: MessageRequest, res: Response) => {
        const { rating, title, description } = req.body;

        if (rating < 0.5 || rating > 5) {
            return res.status(400).json({
                error: "Rating must be between 0.5 and 5",
            });
        }

        if (title.trim().length == 0) {
            return res.status(400).json({
                error: "Title must not be empty",
            });
        }

        if (title.trim().length > 64) {
            return res.status(400).json({
                error: "Title must be less than 64 characters",
            });
        }

        if (description.length > 512) {
            return res.status(400).json({
                error: "Description must be less than 512 characters",
            });
        }

        if (!req.message?.request) {
            return res.status(400).json({
                error: "Message must be a request",
            });
        }

        if (
            req.message.request.request_type != RequestMessageType.COMPLETE ||
            req.message.request.status != RequestMessageStatus.ACCEPTED
        ) {
            return res.status(400).json({
                error: "Message must be a completed request",
            });
        }

        const isEmployee = req.channel!.post.user_id != req.user!.id;

        const data = JSON.parse(req.message.request.data!);

        if (
            (isEmployee && data.left_review_by_employee) ||
            (!isEmployee && data.left_review_by_employer)
        ) {
            return res.status(400).json({
                error: "You have already left a review",
            });
        }

        if (req.channel!.status !== ChannelStatus.COMPLETED) {
            return res.status(400).json({
                error: "Channel must be completed to leave a review",
            });
        }

        const otherUser = req.channel!.getOtherUser(req.user!.id);

        if (!otherUser) {
            return res.status(500).json({
                error: "Internal server error",
            });
        }

        const review = await ReviewWrites.createReview({
            user: req.user!,
            user_profile: req.profile!,
            rating_for: otherUser,
            post: req.channel!.post,
            rating,
            title: title.trim(),
            description: description.trim(),
        });

        if (!review) {
            return res.status(500).json({
                error: "Internal server error",
            });
        }

        if (isEmployee) {
            data.left_review_by_employee = true;
        } else {
            data.left_review_by_employer = true;
        }

        await req.message.updateRequestMessage({
            data: JSON.stringify(data),
        });

        res.status(200).json({
            review: getReviewResponse(review, req.user!),
        });

        // Send socket events

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
    },
];
