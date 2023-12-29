// GET /v1/channels/:uuid/messages
// Returns messages from a channel

import { Response } from "express";
import { authorize } from "../../../../../middleware/authorization";
import { requireMethod } from "../../../../../middleware/require_method";
import { ExtendedRequest } from "../../../../../types/request";
import { ChannelReads } from "../../../../../database/wrappers/chats/channels/wrapper";
import { MessageReads } from "../../../../../database/wrappers/chats/messages/wrapper";
import { getMessageResponse } from "../../responses";
import { ChannelRequest, withChannel } from "../middleware";

export default [
    requireMethod("GET"),
    authorize(false),
    withChannel,
    async (req: ChannelRequest, res: Response) => {
        try {
            const offset = parseInt(req.query.offset as string) || 0;

            const messages = await MessageReads.getMessagesFromChannel(
                req.channel!.id,
                offset
            );

            res.status(200).json({
                messages: messages.map((message) =>
                    getMessageResponse(message, req.user!)
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
