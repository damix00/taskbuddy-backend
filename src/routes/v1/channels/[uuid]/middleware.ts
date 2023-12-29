import { NextFunction, Response } from "express";
import Channel from "../../../../database/wrappers/chats/channels";
import { ExtendedRequest } from "../../../../types/request";
import { ChannelReads } from "../../../../database/wrappers/chats/channels/wrapper";

export interface ChannelRequest extends ExtendedRequest {
    channel?: Channel;
}

export async function withChannel(
    req: ChannelRequest,
    res: Response,
    next: NextFunction
) {
    const { uuid } = req.params;

    const channel = await ChannelReads.getChannelByUUID(uuid, req.user!.id);

    if (!channel) {
        res.status(404).json({
            error: "Channel not found",
        });
        return;
    }

    req.channel = channel;

    next();
}
