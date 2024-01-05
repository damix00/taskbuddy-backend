// DELETE /v1/channels/:uuid/messages/:message_uuid
// Deletes a message from a channel

import { Response } from "express";
import { MessageRequest, withMessage } from "./middleware";
import { getMessageResponse } from "../../../responses";

export default async (req: MessageRequest, res: Response) => {
    try {
        if (req.message!.sender_id != req.user!.id) {
            res.status(403).json({
                error: "You cannot delete this message",
            });
            return;
        }

        await req.message!.deleteMessage();

        res.status(200).json({
            message: getMessageResponse(
                req.message!,
                req.user!,
                req.channel!.uuid
            ),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};
