import Channel from ".";
import { ChannelFields } from "../../../models/chats/channels";
import reads from "./queries/reads";
import writes from "./queries/writes";

function toChannel(channel: ChannelFields | null) {
    if (!channel) return null;

    channel.id = parseInt(channel.id as any);
    channel.post_id = parseInt(channel.post_id as any);
    channel.status = parseInt(channel.status as any);
    channel.negotiated_price = parseFloat(channel.negotiated_price as any);
    channel.recipient_id = parseInt(channel.recipient_id as any);
    channel.created_by_id = parseInt(channel.created_by_id as any);

    return new Channel(channel);
}

export class ChannelReads {
    public static async getChannelById(
        id: number,
        requested_by_id: number
    ): Promise<Channel | null> {
        return toChannel(await reads.getChannelById(id, requested_by_id));
    }

    public static async getChannelByUUID(
        uuid: string,
        requested_by_id: number
    ): Promise<Channel | null> {
        return toChannel(await reads.getChannelByUUID(uuid, requested_by_id));
    }

    public static async getOutgoingChannels(
        requested_by_id: number,
        offset: number = 0
    ): Promise<Channel[]> {
        const channels = await reads.getOutgoingChannels(
            requested_by_id,
            offset
        );

        if (!channels) return [];

        return channels.map((channel) => toChannel(channel) as Channel);
    }

    public static async getIncomingChannels(
        requested_by_id: number,
        offset: number = 0
    ): Promise<Channel[]> {
        const channels = await reads.getIncomingChannels(
            requested_by_id,
            offset
        );

        if (!channels) return [];

        return channels.map((channel) => toChannel(channel) as Channel);
    }

    public static async getChannelByPostId(
        post_id: number,
        requested_by_id: number
    ): Promise<Channel | null> {
        return toChannel(
            await reads.getChannelByPostId(post_id, requested_by_id)
        );
    }
}

export class ChannelWrites {
    public static async createChannel(data: writes.CreateChannelFields) {
        const channel = await writes.createChannel(data);

        if (!channel) return null;

        return toChannel(channel);
    }

    public static async updateChannel(fields: ChannelFields): Promise<boolean> {
        return await writes.updateChannel(fields);
    }
}
