import Channel from ".";
import {
    ChannelFields,
    ChannelWithRelations,
} from "../../../models/chats/channels";
import Post from "../../posts/post";
import reads from "./queries/reads";
import writes from "./queries/writes";

function toChannel(channel: ChannelWithRelations | null) {
    if (!channel) return null;

    channel.id = parseInt(channel.id as any);
    channel.post_id = parseInt(channel.post_id as any);
    channel.status = parseInt(channel.status as any);
    channel.negotiated_price = parseFloat(channel.negotiated_price as any);
    channel.recipient_id = parseInt(channel.recipient_id as any);
    channel.created_by_id = parseInt(channel.created_by_id as any);

    channel.post = new Post(
        {
            ...channel.post,
            // @ts-ignore
            media: channel.media,
            // @ts-ignore
            tags: channel.tags,
            // @ts-ignore
            likes: channel.post_interactions.likes,
            // @ts-ignore
            comments: channel.post_interactions.comments,
            // @ts-ignore
            shares: channel.post_interactions.shares,
            // @ts-ignore
            bookmarks: channel.post_interactions.bookmarks,
            // @ts-ignore
            impressions: channel.post_interactions.impressions,
            // @ts-ignore
            removed: channel.post_removals.removed,
            // @ts-ignore
            removal_reason: channel.post_removals.removal_reason,
            // @ts-ignore
            flagged: channel.post_removals.flagged,
            // @ts-ignore
            flagged_reason: channel.post_removals.flagged_reason,
            // @ts-ignore
            shadow_banned: channel.post_removals.shadow_banned,
            // @ts-ignore
            remote: channel.post_location.remote,
            // @ts-ignore
            lat: channel.post_location.lat,
            // @ts-ignore
            lon: channel.post_location.lon,
            // @ts-ignore
            approx_lat: channel.post_location.approx_lat,
            // @ts-ignore
            approx_lon: channel.post_location.approx_lon,
            // @ts-ignore
            suggestion_radius: channel.post_location.suggestion_radius,
            // @ts-ignore
            location_name: channel.post_location.location_name,
        },
        false
    );

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

        const found = await reads.getChannelById(
            channel.id,
            channel.created_by_id
        );

        if (!found) return null;

        return toChannel(found);
    }

    public static async updateChannel(fields: ChannelFields): Promise<boolean> {
        return await writes.updateChannel(fields);
    }
}
