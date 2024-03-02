// GET /v1/channels/outgoing
// Get all outgoing channels

import { Response } from "express";
import { authorize } from "../../../middleware/authorization";
import { ExtendedRequest } from "../../../types/request";
import { ChannelReads } from "../../../database/wrappers/chats/channels/wrapper";
import { getChannelResponse } from "./responses";

export default [
    authorize(false),
    async (req: ExtendedRequest, res: Response) => {
        try {
            const { offset } = req.query;

            if (isNaN(offset as any)) {
                res.status(400).send({ error: "Invalid offset" });
                return;
            }

            const offsetInt = parseInt(offset as string);

            const channels = await ChannelReads.getOutgoingChannels(
                req.user!.id,
                offsetInt
            );

            res.status(200).json({
                channels: channels
                    .filter((channel) => !!channel)
                    .map((channel) => getChannelResponse(channel, req.user!)),
            });
        } catch (err) {
            console.error(err);
            res.status(500).send({ error: "Internal server error" });
        }
    },
];
