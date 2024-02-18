// POST /v1/channels/:uuid/seen
// Mark everything as seen in a channel

import { Response } from "express";
import { authorize } from "../../../../middleware/authorization";
import { requireMethod } from "../../../../middleware/require_method";
import { ExtendedRequest } from "../../../../types/request";
import { ChannelRequest, withChannel } from "./middleware";

export default [
    requireMethod("POST"),
    authorize(true),
    withChannel,
    async (req: ChannelRequest, res: Response) => {
        try {
            if (!(await req.channel!.markAsSeen(req.user!.id))) {
                return res.status(500).json({
                    message: "Internal server error",
                });
            }

            res.status(200).json({
                message: "Success",
            });

            const socketData = {
                channel_uuid: req.channel!.uuid,
                user_id: req.user!.id,
            };

            if (req.channel!.recipient_id === req.user!.id) {
                req.channel!.created_by.sendSocketEvent(
                    "channel_seen",
                    socketData
                );
            } else if (req.channel!.created_by_id === req.user!.id) {
                req.channel!.recipient.sendSocketEvent(
                    "channel_seen",
                    socketData
                );
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
