// GET /v1/channels/:uuid
// Returns a channel by its UUID.

import { Response } from "express";
import { authorize } from "../../../../middleware/authorization";
import { requireMethod } from "../../../../middleware/require_method";
import { ExtendedRequest } from "../../../../types/request";
import { ChannelReads } from "../../../../database/wrappers/chats/channels/wrapper";
import { getChannelResponse } from "../responses";

export default [
    requireMethod("GET"),
    authorize(false),
    async (req: ExtendedRequest, res: Response) => {
        const { uuid } = req.params;

        const channel = await ChannelReads.getChannelByUUID(uuid, req.user!.id);

        if (!channel) {
            res.status(404).json({
                error: "Channel not found",
            });
            return;
        }

        res.status(200).json({
            channel: getChannelResponse(channel, req.user!),
        });
    },
];
