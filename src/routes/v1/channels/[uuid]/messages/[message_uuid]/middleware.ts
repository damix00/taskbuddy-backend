import { NextFunction, Response } from "express";
import Message from "../../../../../../database/wrappers/chats/messages";
import { ChannelRequest } from "../../middleware";
import { MessageReads } from "../../../../../../database/wrappers/chats/messages/wrapper";

export interface MessageRequest extends ChannelRequest {
    message?: Message;
}

export async function withMessage(
    req: MessageRequest,
    res: Response,
    next: NextFunction
) {
    const messageUuid = req.params.message_uuid;

    if (!messageUuid) {
        res.status(400).json({ error: "Missing message_uuid" });
        return;
    }

    const message = await MessageReads.getMessageByUUID(messageUuid);

    if (!message) {
        res.status(404).json({ error: "Message not found" });
        return;
    }

    req.message = message;

    next();
}
