import Channel from ".";
import {
    ChannelFields,
    ChannelWithRelations,
} from "../../../models/chats/channels";
import { PostMedia, PostTags } from "../../../models/posts/post";
import { User } from "../../accounts/users";
import Post from "../../posts/post";
import reads from "./queries/reads";
import writes from "./queries/writes";

interface DatabaseChannel extends ChannelWithRelations {
    media: PostMedia[];
    tags: PostTags[];
    post_interactions: {
        likes: number;
        comments: number;
        shares: number;
        bookmarks: number;
        impressions: number;
    };
    post_removals: {
        removed: boolean;
        removal_reason: string;
        flagged: boolean;
        flagged_reason: string;
        shadow_banned: boolean;
    };
    post_location: {
        remote: boolean;
        lat: number;
        lon: number;
        approx_lat: number;
        approx_lon: number;
        suggestion_radius: number;
        location_name: string;
    };
    last_message_senders: User[];
}

function toChannel(channel: ChannelWithRelations | null) {
    if (!channel) return null;

    const _channel: DatabaseChannel = channel as DatabaseChannel;

    channel.id = parseInt(channel.id as any);
    channel.post_id = parseInt(channel.post_id as any);
    channel.status = parseInt(channel.status as any);
    channel.negotiated_price = parseFloat(channel.negotiated_price as any);
    channel.recipient_id = parseInt(channel.recipient_id as any);
    channel.created_by_id = parseInt(channel.created_by_id as any);

    channel.created_by = new User(channel.created_by, false);
    channel.recipient = new User(channel.recipient, false);

    channel.post = new Post(
        {
            ...channel.post,
            media: _channel.media,
            tags: _channel.tags,
            likes: _channel.post_interactions.likes,
            comments: _channel.post_interactions.comments,
            shares: _channel.post_interactions.shares,
            bookmarks: _channel.post_interactions.bookmarks,
            impressions: _channel.post_interactions.impressions,
            removed: _channel.post_removals.removed,
            removal_reason: _channel.post_removals.removal_reason,
            flagged: _channel.post_removals.flagged,
            flagged_reason: _channel.post_removals.flagged_reason,
            shadow_banned: _channel.post_removals.shadow_banned,
            remote: _channel.post_location.remote,
            lat: _channel.post_location.lat,
            lon: _channel.post_location.lon,
            approx_lat: _channel.post_location.approx_lat,
            approx_lon: _channel.post_location.approx_lon,
            suggestion_radius: _channel.post_location.suggestion_radius,
            location_name: _channel.post_location.location_name,
            classified_category: channel.post.classified_category,
            reserved: channel.post.reserved,
        },
        false
    );

    channel.last_messages.map((message, i) => {
        message.id = parseInt(message.id as any);
        message.channel_id = parseInt(message.channel_id as any);
        message.sender_id = parseInt(message.sender_id as any);
        message.created_at = new Date(message.created_at as any);
        message.updated_at = new Date(message.updated_at as any);

        let sender;

        if (message.sender_id == channel.created_by_id) {
            sender = channel.created_by;
        } else if (message.sender_id == channel.recipient_id) {
            sender = channel.recipient;
        }

        const senderProfile =
            message.sender_id == channel.created_by_id
                ? channel.creator_profile
                : channel.recipient_profile;

        if (sender) {
            sender.id = parseInt(sender?.id as any);
            message.profile_picture = senderProfile?.profile_picture ?? null;
            message.sender = new User(sender, false);
        }
    });

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

        return channels.map(
            (channel: ChannelWithRelations) => toChannel(channel) as Channel
        );
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

        return channels.map(
            (channel: ChannelWithRelations) => toChannel(channel) as Channel
        );
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
