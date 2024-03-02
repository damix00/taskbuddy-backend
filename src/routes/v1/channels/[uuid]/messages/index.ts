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

            for (const msg of messages) {
                if (msg.sender == null) {
                    continue;
                }

                if (msg.sender.id == req.channel!.created_by_id) {
                    msg.profile_picture =
                        req.channel!.creator_profile.profile_picture;
                } else if (msg.sender.id == req.channel!.recipient_id) {
                    msg.profile_picture =
                        req.channel!.recipient_profile.profile_picture;
                }
            }

            res.status(200).json({
                messages: messages
                    .filter((message) => !!message)
                    .map((message) =>
                        getMessageResponse(
                            message,
                            req.user!,
                            req.channel!.uuid
                        )
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
