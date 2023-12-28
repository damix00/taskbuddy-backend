import { executeQuery } from "../../../../connection";
import { ChannelWithRelations } from "../../../../models/chats/channels";

namespace reads {
    async function getChannelByField(
        field: string,
        value: any,
        requested_by_id: number,
        fetchMany: boolean = false,
        offset: number = 0
    ): Promise<ChannelWithRelations[] | ChannelWithRelations | null> {
        try {
            const q = `
                SELECT channels.*,
                    TO_JSON(creator_data.*) AS created_by,
                    TO_JSON(recipient_data.*) AS recipient,
                    TO_JSON(creator_profile.*) AS created_by_profile,
                    TO_JSON(recipient_profile.*) AS recipient_profile,
                    TO_JSON(posts.*) AS post,
                    EXISTS(SELECT 1 FROM follows WHERE follows.follower = $2 AND follows.following = creator_data.id) AS recipient_following,
                    EXISTS(SELECT 1 FROM follows WHERE follows.follower = $2 AND follows.following = recipient_data.id) AS creator_following,
                    -- Last message
                    COALESCE(json_agg(DISTINCT messages) FILTER (WHERE messages.channel_id IS NOT NULL), '[]') AS last_messages
                FROM channels
                LEFT JOIN users AS creator_data ON channels.created_by_id = creator_data.id
                LEFT JOIN users AS recipient_data ON channels.recipient_id = recipient_data.id
                LEFT JOIN profiles AS creator_profile ON channels.created_by_id = creator_profile.user_id
                LEFT JOIN profiles AS recipient_profile ON channels.recipient_id = recipient_profile.user_id
                LEFT JOIN posts ON channels.post_id = posts.id
                LEFT JOIN messages ON messages.channel_id = channels.id
                LEFT JOIN (
                    SELECT sender_id, message, deleted, created_at FROM messages
                    WHERE messages.channel_id = channels.id
                    ORDER BY messages.created_at DESC
                    LIMIT 1
                ) AS last_message_data ON TRUE
                WHERE ${field} = $1 AND (channels.created_by_id = $2 OR channels.recipient_id = $2)
                ORDER BY channels.last_message_time DESC
                ${fetchMany ? `OFFSET $3 LIMIT 20` : ""}
            `;

            const p = [value, requested_by_id];
            if (fetchMany) p.push(offset);

            const result = await executeQuery<ChannelWithRelations>(q, p);

            if (fetchMany) return result;

            if (result.length == 0) return null;

            return result[0];
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    export async function getChannelById(
        id: number,
        requested_by_id: number
    ): Promise<ChannelWithRelations | null> {
        return (await getChannelByField(
            "channels.id",
            id,
            requested_by_id
        )) as ChannelWithRelations | null;
    }

    export async function getChannelByUUID(
        uuid: string,
        requested_by_id: number
    ): Promise<ChannelWithRelations | null> {
        return (await getChannelByField(
            "channels.uuid",
            uuid,
            requested_by_id
        )) as ChannelWithRelations | null;
    }

    export async function getOutgoingChannels(
        requested_by_id: number,
        offset: number = 0
    ): Promise<ChannelWithRelations[]> {
        return (await getChannelByField(
            "channels.created_by_id",
            requested_by_id,
            requested_by_id,
            true,
            offset
        )) as ChannelWithRelations[];
    }

    export async function getIncomingChannels(
        requested_by_id: number,
        offset: number = 0
    ): Promise<ChannelWithRelations[]> {
        return (await getChannelByField(
            "channels.recipient_id",
            requested_by_id,
            requested_by_id,
            true,
            offset
        )) as ChannelWithRelations[];
    }

    export async function getChannelByPostId(
        post_id: number,
        requested_by_id: number
    ): Promise<ChannelWithRelations | null> {
        return (await getChannelByField(
            "channels.post_id",
            post_id,
            requested_by_id
        )) as ChannelWithRelations | null;
    }
}

export default reads;
