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
                    TO_JSON(creator_profile.*) AS creator_profile,
                    TO_JSON(recipient_profile.*) AS recipient_profile,
                    TO_JSON(posts.*) AS post,
                    EXISTS(SELECT 1 FROM follows WHERE follows.follower = $2 AND follows.following = creator_data.id) AS recipient_following,
                    EXISTS(SELECT 1 FROM follows WHERE follows.follower = $2 AND follows.following = recipient_data.id) AS creator_following,

                    -- Last messages
                    COALESCE(json_agg(DISTINCT messages) FILTER (WHERE messages.channel_id IS NOT NULL), '[]') AS last_messages,
                    EXISTS(SELECT 1 FROM post_interaction_logs WHERE post_interaction_logs.user_id = $2 AND post_interaction_logs.post_id = posts.id AND interaction_type = 0) AS liked,
                    EXISTS(SELECT 1 FROM post_interaction_logs WHERE post_interaction_logs.user_id = $2  AND post_interaction_logs.post_id = posts.id AND interaction_type = 3) AS bookmarked,

                    COALESCE(json_agg(DISTINCT post_media) FILTER (WHERE post_media.id IS NOT NULL), '[]') AS media,
                    COALESCE(json_agg(DISTINCT post_tag_relationship) FILTER (WHERE post_tag_relationship.post_id IS NOT NULL), '[]') AS tags,

                    TO_JSON(post_location.*) AS post_location,
                    TO_JSON(post_interactions.*) AS post_interactions,
                    TO_JSON(post_removals.*) AS post_removals
                FROM channels

                LEFT JOIN users AS creator_data ON channels.created_by_id = creator_data.id
                LEFT JOIN users AS recipient_data ON channels.recipient_id = recipient_data.id
                LEFT JOIN profiles AS creator_profile ON channels.created_by_id = creator_profile.user_id
                LEFT JOIN profiles AS recipient_profile ON channels.recipient_id = recipient_profile.user_id
                LEFT JOIN posts ON channels.post_id = posts.id
                LEFT JOIN messages ON channels.id = messages.channel_id

                LEFT JOIN post_media ON posts.id = post_media.post_id
                LEFT JOIN post_tag_relationship ON posts.id = post_tag_relationship.post_id
                LEFT JOIN post_location ON posts.post_location_id = post_location.id
                LEFT JOIN post_interactions ON posts.interactions_id = post_interactions.id
                LEFT JOIN post_removals ON posts.removals_id = post_removals.id

                WHERE ${field} = $1 AND (channels.created_by_id = $2 OR channels.recipient_id = $2)
                GROUP BY channels.id, creator_data.id,
                    recipient_data.id, creator_profile.id,
                    recipient_profile.id, posts.id,
                    post_location.id, post_interactions.id,
                    post_removals.id 
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
